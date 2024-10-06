/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions from "../actions.js";
import type * as admins from "../admins.js";
import type * as editorSnapshots from "../editorSnapshots.js";
import type * as functions from "../functions.js";
import type * as inviteCodes from "../inviteCodes.js";
import type * as questions from "../questions.js";
import type * as sessions from "../sessions.js";
import type * as types from "../types.js";
import type * as userProfiles from "../userProfiles.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  admins: typeof admins;
  editorSnapshots: typeof editorSnapshots;
  functions: typeof functions;
  inviteCodes: typeof inviteCodes;
  questions: typeof questions;
  sessions: typeof sessions;
  types: typeof types;
  userProfiles: typeof userProfiles;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
