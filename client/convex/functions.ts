import { isDefined } from "@/lib/utils";
import { entsTableFactory } from "convex-ents";
import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { Rules } from "convex-helpers/server/rowLevelSecurity";
import {
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  UserIdentity,
} from "convex/server";
import { components, internal } from "./_generated/api";
import { DataModel, Id } from "./_generated/dataModel";
import {
  action,
  internalAction as baseInternalAction,
  internalMutation as baseInternalMutation,
  internalQuery as baseInternalQuery,
  mutation as baseMutation,
  query as baseQuery,
} from "./_generated/server";
import { entDefinitions } from "./schema";
import { Triggers } from "convex-helpers/server/triggers";
import { TableAggregate } from "@convex-dev/aggregate";
import { Migrations } from "@convex-dev/migrations";
import { SubscriptionTier } from "./schema";
import { updateMetrics } from "./metrics";

// Must be defined in the functions.ts file to ensure that the triggers are registered
export const triggers = new Triggers<DataModel>();
export const migrations = new Migrations<DataModel>(components.migrations);

type Ctx = {
  user: UserIdentity;
};

const rules: Rules<Ctx, DataModel> = {
  questions: {
    modify: async () => false,
    insert: async () => false,
  },
  sessions: {
    read: async ({ user }, { userId }) => {
      return user.subject === userId;
    },
    modify: async ({ user }, { userId }) => {
      return user.subject === userId;
    },
    insert: async ({ user }, { userId }) => {
      return user.subject === userId;
    },
  },
  codeSessionStates: {
    modify: async () => false,
  },
  userProfiles: {
    modify: async ({ user }, { userId }) => user.subject === userId,
    insert: async ({ user }, { userId }) => user.subject === userId,
  },
};

export const query = customQuery(
  baseQuery,
  customCtx(async (ctx) => {
    return {
      table: entsTableFactory(ctx, entDefinitions),
      db: undefined,
    };
  })
);

export const internalQuery = customQuery(
  baseInternalQuery,
  customCtx(async (ctx) => {
    return {
      table: entsTableFactory(ctx, entDefinitions),
      db: undefined,
    };
  })
);

const wrappedMutation = customMutation(
  baseMutation,
  customCtx(triggers.wrapDB)
);
const wrappedInternalMutation = customMutation(
  baseInternalMutation,
  customCtx(triggers.wrapDB)
);

export const mutation = customMutation(
  wrappedMutation,
  customCtx(async (ctx) => {
    return {
      table: entsTableFactory(ctx, entDefinitions),
      db: undefined,
    };
  })
);

export const internalMutation = customMutation(
  wrappedInternalMutation,
  customCtx(async (ctx) => {
    return {
      table: entsTableFactory(ctx, entDefinitions),
      db: undefined,
    };
  })
);

export const internalAction = customAction(
  baseInternalAction,
  customCtx(async (ctx) => {
    return {};
  })
);

export const userQuery = customQuery(
  baseQuery,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    return {
      user,
      table: entsTableFactory(ctx, entDefinitions),
      db: undefined,
    };
  })
);

export const userMutation = customMutation(
  wrappedMutation,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    return {
      user,
      table: entsTableFactory(ctx, entDefinitions),
      db: undefined,
    };
  })
);

export const userAction = customAction(
  action,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    return { user };
  })
);

export const adminQuery = customQuery(
  baseQuery,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    await ensureProfileRole(ctx, user.subject, "admin");
    return {
      user,
      table: entsTableFactory(ctx, entDefinitions),
      db: undefined,
    };
  })
);

export const adminMutation = customMutation(
  wrappedMutation,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    await ensureProfileRole(ctx, user.subject, "admin");
    return {
      user,
      table: entsTableFactory(ctx, entDefinitions),
      db: undefined,
    };
  })
);

export const adminAction = customAction(
  action,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    const profile = await ctx.runQuery(
      internal.userProfiles.getUserProfileInternal,
      {
        userId: user.subject,
      }
    );

    if (profile.role !== "admin") {
      throw new Error("Sorry, you must be an admin to perform this operation.");
    }

    return { user };
  })
);

async function ensureIdentity(
  ctx:
    | GenericQueryCtx<DataModel>
    | GenericMutationCtx<DataModel>
    | GenericActionCtx<DataModel>
) {
  const user = await ctx.auth.getUserIdentity();
  if (!user) {
    throw new Error("Sorry, you must be logged in to perform this operation.");
  }

  return user;
}

async function ensureProfileRole(
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
  userId: string,
  role: "admin" | "user" | "waitlist"
) {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .first();

  if (!isDefined(profile) || profile.role !== role) {
    throw new Error(`Sorry, you must be a ${role} to perform this operation.`);
  }

  return profile;
}

/*
 * My experience is that Aggregate must be in the same place of triggers being defined
 * Otherwise the npx convex dev would fail or the aggregate may not work
 * If the file gets too big, we can move the aggregates to a separate file
 * make sure testing is still working
 */
export const userMetricsAggregate = new TableAggregate<{
  Namespace: string;
  DataModel: DataModel;
  TableName: "userProfiles";
  Key: number;
}>(components.userMetricsAggregate, {
  namespace: (doc) => doc.role,
  sortKey: (doc) => doc._creationTime,
});

export const userSubscriptionMetricsAggregate = new TableAggregate<{
  Namespace: string;
  DataModel: DataModel;
  TableName: "userProfiles";
  Key: number;
}>(components.userSubscriptionMetricsAggregate, {
  namespace: (doc) => doc.subscription,
  sortKey: (doc) => doc._creationTime,
});

export const sessionMetricsAggregate = new TableAggregate<{
  DataModel: DataModel;
  TableName: "sessions";
  Key: [string, boolean];
}>(components.sessionMetricsAggregate, {
  sortKey: (doc) => [doc.sessionStatus, doc.evalReady],
});

export const clearAggregates = baseInternalMutation({
  args: {},
  handler: async (ctx) => {
    for (const role of ["admin", "user", "waitlist"]) {
      console.log("clearing role for ", role);
      await userMetricsAggregate.clear(ctx, { namespace: role });
    }
    for (const subscription of Object.values(SubscriptionTier)) {
      console.log("clearing subscription for ", subscription);
      await userSubscriptionMetricsAggregate.clear(ctx, {
        namespace: subscription,
      });
    }
    await sessionMetricsAggregate.clear(ctx);
  },
});

triggers.register("userProfiles", userSubscriptionMetricsAggregate.trigger());
triggers.register("userProfiles", userMetricsAggregate.trigger());
triggers.register("sessions", sessionMetricsAggregate.trigger());


export const backfillAggregatesMigration = migrations.define({
  table: "userProfiles",
  migrateOne: async (ctx, doc) => {
    await userMetricsAggregate.insertIfDoesNotExist(ctx, doc);
    await userSubscriptionMetricsAggregate.insertIfDoesNotExist(ctx, doc);
    console.log("backfilled", doc.email, doc.role, doc.subscription);
  },
});

export const backfillSessionsMigration = migrations.define({
  table: "sessions",
  migrateOne: async (ctx, doc) => {
    await sessionMetricsAggregate.insertIfDoesNotExist(ctx, doc);
  },
});

// npx convex run functions:clearAggregates
// npx convex run functions:runSessionAggregationBackfill '{"cursor": null}'
// npx convex run functions:runUserAggregationBackfill '{"cursor": null}'
export const runUserAggregationBackfill = migrations.runner(
  internal.functions.backfillAggregatesMigration
);

export const runSessionAggregationBackfill = migrations.runner(
  internal.functions.backfillSessionsMigration
);
