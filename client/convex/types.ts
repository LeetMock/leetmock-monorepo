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
  testcase_changed: v.object({
    type: v.literal("testcase_changed"),
    data: v.object({
      before: v.array(
        v.object({
          input: v.record(v.string(), v.any()),
          expectedOutput: v.optional(v.any()),
        })
      ),
      after: v.array(
        v.object({
          input: v.record(v.string(), v.any()),
          expectedOutput: v.optional(v.any()),
        })
      ),
    }),
  }),
  testcase_removed: v.object({
    type: v.literal("testcase_removed"),
    data: v.any(), // TODO: change this to the actual data type
  }),
  user_testcase_executed: v.object({
    type: v.literal("user_testcase_executed"),
    data: v.object({
      testResults: v.array(
        v.object({
          caseNumber: v.number(),
          passed: v.boolean(),
          input: v.record(v.string(), v.any()),
          expected: v.any(),
          actual: v.any(),
          error: v.union(v.string(), v.null()),
          stdout: v.union(v.string(), v.null()),
        })
      ),
    }),
  }),
  groundtruth_testcase_executed: v.object({
    type: v.literal("groundtruth_testcase_executed"),
    data: v.object({
      testResults: v.array(
        v.object({
          caseNumber: v.number(),
          passed: v.boolean(),
          input: v.record(v.string(), v.any()),
          expected: v.any(),
          actual: v.any(),
          error: v.union(v.string(), v.null()),
          stdout: v.union(v.string(), v.null()),
        })
      ),
    }),
  }),
  stage_switched: v.object({
    type: v.literal("stage_switched"),
    data: v.object({
      stage: v.string(),
    }),
  }),
};

export const codeSessionEventSchema = v.union(
  codeSessionEventSchemas.content_changed,
  codeSessionEventSchemas.testcase_removed,
  codeSessionEventSchemas.stage_switched,
  codeSessionEventSchemas.testcase_changed,
  codeSessionEventSchemas.user_testcase_executed,
  codeSessionEventSchemas.groundtruth_testcase_executed,
  codeSessionEventSchemas.stage_switched
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

export type CodeSessionTestcaseChanged =
  (typeof codeSessionEventSchemas)["testcase_changed"]["type"];

export type CodeSessionTestcaseRemoved =
  (typeof codeSessionEventSchemas)["testcase_removed"]["type"];

export type CodeSessionStageSwitched = (typeof codeSessionEventSchemas)["stage_switched"]["type"];

export type CodeSessionUserTestcaseExecuted =
  (typeof codeSessionEventSchemas)["user_testcase_executed"]["type"];

export type CodeSessionGroundtruthTestcaseExecuted =
  (typeof codeSessionEventSchemas)["groundtruth_testcase_executed"]["type"];
