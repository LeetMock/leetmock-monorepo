import { GenericEnt, GenericEntWriter } from "convex-ents";
import { CustomCtx } from "convex-helpers/server/customFunctions";
import { v } from "convex/values";
import { TableNames } from "./_generated/dataModel";
import { mutation, query } from "./functions";
import { entDefinitions } from "./schema";

// Code Session Event Types
export const codeSessionEventSchemas = {
  content_changed: v.object({
    type: v.literal("content_changed"),
    data: v.object({
      before: v.string(),
      after: v.string(),
    }),
  }),
  user_test_executed: v.object({
    type: v.literal("user_test_executed"),
    data: v.any(), // TODO: change this to the actual data type
  }),
  testcase_added: v.object({
    type: v.literal("testcase_added"),
    data: v.any(), // TODO: change this to the actual data type
  }),
  testcase_changed: v.object({
    type: v.literal("testcase_changed"),
    data: v.object({
      before: v.array(v.object({
        input: v.record(v.string(), v.any()),
        expectedOutput: v.optional(v.any()),
      })),
      after: v.array(v.object({
        input: v.record(v.string(), v.any()),
        expectedOutput: v.optional(v.any()),
      })),
    }),
  }),
  testcase_removed: v.object({
    type: v.literal("testcase_removed"),
    data: v.any(), // TODO: change this to the actual data type
  }),
  user_testcase_executed: v.object({
    type: v.literal("user_testcase_executed"),
    data: v.object({
      testResults: v.array(v.object({
        caseNumber: v.number(),
        passed: v.boolean(),
        input: v.record(v.string(), v.any()),
        expected: v.any(),
        actual: v.any(),
        error: v.union(v.string(), v.null()),
        stdout: v.union(v.string(), v.null())
      })),
    }),
  }),
  groundtruth_testcase_executed: v.object({
    type: v.literal("groundtruth_testcase_executed"),
    data: v.object({
      testResults: v.array(v.object({
        caseNumber: v.number(),
        passed: v.boolean(),
        input: v.record(v.string(), v.any()),
        expected: v.any(),
        actual: v.any(),
        error: v.union(v.string(), v.null()),
        stdout: v.union(v.string(), v.null())
      })),
    }),
  }),
  question_displayed: v.object({
    type: v.literal("question_displayed"),
    data: v.boolean(),
  }),
};

export const codeSessionEventSchema = v.union(
  codeSessionEventSchemas.content_changed,
  codeSessionEventSchemas.user_test_executed,
  codeSessionEventSchemas.testcase_added,
  codeSessionEventSchemas.testcase_removed,
  codeSessionEventSchemas.question_displayed,
  codeSessionEventSchemas.testcase_changed,
  codeSessionEventSchemas.user_testcase_executed
);

export type QueryCtx = CustomCtx<typeof query>;
export type MutationCtx = CustomCtx<typeof mutation>;

export type Ent<TableName extends TableNames> = GenericEnt<typeof entDefinitions, TableName>;
export type EntWriter<TableName extends TableNames> = GenericEntWriter<
  typeof entDefinitions,
  TableName
>;

export type CodeSessionEvent = (typeof codeSessionEventSchema)["type"];

export type CodeSessionEventType = keyof typeof codeSessionEventSchemas;

export type CodeSessionContentChanged = (typeof codeSessionEventSchemas)["content_changed"]["type"];

export type CodeSessionUserTestExecuted =
  (typeof codeSessionEventSchemas)["user_test_executed"]["type"];

export type CodeSessionTestcaseAdded = (typeof codeSessionEventSchemas)["testcase_added"]["type"];

export type CodeSessionTestcaseRemoved =
  (typeof codeSessionEventSchemas)["testcase_removed"]["type"];

export type CodeSessionQuestionDisplayed =
  (typeof codeSessionEventSchemas)["question_displayed"]["type"];
