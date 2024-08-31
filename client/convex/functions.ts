import { ConvexError } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import {
  customQuery,
  customCtx,
  customMutation,
  customAction,
} from "convex-helpers/server/customFunctions";
import {
  Rules,
  wrapDatabaseReader,
  wrapDatabaseWriter,
} from "convex-helpers/server/rowLevelSecurity";
import { UserIdentity } from "convex/server";
import { DataModel } from "./_generated/dataModel";

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
};

export const userQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Sorry, you must be logged in to perform this action",
      });
    }

    const db = wrapDatabaseReader({ user }, ctx.db, rules);

    return { user, db };
  })
);

export const userMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Sorry, you must be logged in to perform this action",
      });
    }

    const db = wrapDatabaseWriter({ user }, ctx.db, rules);

    return { user, db };
  })
);

export const userAction = customAction(
  action,
  customCtx(async (ctx) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Sorry, you must be logged in to perform this action",
      });
    }

    return { user };
  })
);
