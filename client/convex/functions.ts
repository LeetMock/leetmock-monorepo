import {
  customQuery,
  customCtx,
  customMutation,
  customAction,
} from "convex-helpers/server/customFunctions";
import { Rules } from "convex-helpers/server/rowLevelSecurity";
import { ConvexError } from "convex/values";
import { entsTableFactory } from "convex-ents";
import {
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
  UserIdentity,
} from "convex/server";
import {
  internalMutation as baseInternalMutation,
  internalQuery as baseInternalQuery,
  mutation as baseMutation,
  query as baseQuery,
  action,
} from "./_generated/server";
import { DataModel } from "./_generated/dataModel";
import { isDefined } from "@/lib/utils";
import { internal } from "./_generated/api";
import { entDefinitions } from "./schema";

type LegacyTables = "userProfiles" | "editorSnapshots" | "inviteCodes";

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
  editorSnapshots: {
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
      db: ctx.db as unknown as GenericDatabaseReader<Pick<DataModel, LegacyTables>>,
    };
  })
);

export const internalQuery = customQuery(
  baseInternalQuery,
  customCtx(async (ctx) => {
    return {
      table: entsTableFactory(ctx, entDefinitions),
      db: ctx.db as unknown as GenericDatabaseReader<Pick<DataModel, LegacyTables>>,
    };
  })
);

export const mutation = customMutation(
  baseMutation,
  customCtx(async (ctx) => {
    return {
      table: entsTableFactory(ctx, entDefinitions),
      db: ctx.db as GenericDatabaseWriter<Pick<DataModel, LegacyTables>>,
    };
  })
);

export const internalMutation = customMutation(
  baseInternalMutation,
  customCtx(async (ctx) => {
    return {
      table: entsTableFactory(ctx, entDefinitions),
      db: ctx.db as GenericDatabaseWriter<Pick<DataModel, LegacyTables>>,
    };
  })
);

export const userQuery = customQuery(
  baseQuery,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    const table = entsTableFactory(ctx, entDefinitions);

    return { user, db: ctx.db, table };
  })
);

export const userMutation = customMutation(
  baseMutation,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    const table = entsTableFactory(ctx, entDefinitions);

    return { user, db: ctx.db, table };
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
    const table = entsTableFactory(ctx, entDefinitions);

    return { user, db: ctx.db, table };
  })
);

export const adminMutation = customMutation(
  baseMutation,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    await ensureProfileRole(ctx, user.subject, "admin");
    const table = entsTableFactory(ctx, entDefinitions);

    return { user, db: ctx.db, table };
  })
);

export const adminAction = customAction(
  action,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    const profile = await ctx.runQuery(internal.userProfiles.getUserProfile, {
      userId: user.subject,
    });

    if (!isDefined(profile) || profile.role !== "admin") {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: `Sorry, you must be an admin to perform this operation.`,
      });
    }

    return { user };
  })
);

async function ensureIdentity(
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel> | GenericActionCtx<DataModel>
) {
  const user = await ctx.auth.getUserIdentity();
  if (!user) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Sorry, you must be logged in to perform this operation.",
    });
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
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .first();

  if (!isDefined(profile) || profile.role !== role) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: `Sorry, you must be a ${role} perform this operation.`,
    });
  }

  return profile;
}
