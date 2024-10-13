import {
  customQuery,
  customCtx,
  customMutation,
  customAction,
} from "convex-helpers/server/customFunctions";
import { Rules } from "convex-helpers/server/rowLevelSecurity";
import { ConvexError } from "convex/values";
import { entsTableFactory } from "convex-ents";
import { GenericActionCtx, GenericMutationCtx, GenericQueryCtx, UserIdentity } from "convex/server";
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

export const mutation = customMutation(
  baseMutation,
  customCtx(async (ctx) => {
    return {
      table: entsTableFactory(ctx, entDefinitions),
      db: undefined,
    };
  })
);

export const internalMutation = customMutation(
  baseInternalMutation,
  customCtx(async (ctx) => {
    return {
      table: entsTableFactory(ctx, entDefinitions),
      db: undefined,
    };
  })
);

export const userQuery = customQuery(
  baseQuery,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    return { user, table: entsTableFactory(ctx, entDefinitions), db: undefined };
  })
);

export const userMutation = customMutation(
  baseMutation,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    return { user, table: entsTableFactory(ctx, entDefinitions), db: undefined };
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
    return { user, table: entsTableFactory(ctx, entDefinitions), db: undefined };
  })
);

export const adminMutation = customMutation(
  baseMutation,
  customCtx(async (ctx) => {
    const user = await ensureIdentity(ctx);
    await ensureProfileRole(ctx, user.subject, "admin");
    return { user, table: entsTableFactory(ctx, entDefinitions), db: undefined };
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
