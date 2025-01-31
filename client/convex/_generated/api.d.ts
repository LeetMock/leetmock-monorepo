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
import type * as agentStates from "../agentStates.js";
import type * as codeSessionEvents from "../codeSessionEvents.js";
import type * as codeSessionStates from "../codeSessionStates.js";
import type * as crons from "../crons.js";
import type * as eval from "../eval.js";
import type * as functions from "../functions.js";
import type * as http from "../http.js";
import type * as inviteCodes from "../inviteCodes.js";
import type * as jobs from "../jobs.js";
import type * as pricings from "../pricings.js";
import type * as questions from "../questions.js";
import type * as sessions from "../sessions.js";
import type * as transactions from "../transactions.js";
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
  agentStates: typeof agentStates;
  codeSessionEvents: typeof codeSessionEvents;
  codeSessionStates: typeof codeSessionStates;
  crons: typeof crons;
  eval: typeof eval;
  functions: typeof functions;
  http: typeof http;
  inviteCodes: typeof inviteCodes;
  jobs: typeof jobs;
  pricings: typeof pricings;
  questions: typeof questions;
  sessions: typeof sessions;
  transactions: typeof transactions;
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
