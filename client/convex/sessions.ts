import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { userMutation, userQuery } from "./functions";

export const exists = userQuery({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    try {
      const session = await ctx.db.get(sessionId as Id<"sessions">);
      return !!session;
    } catch (e) {
      return false;
    }
  },
});

export const getById = userQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  },
});

export const getSessionMetadata = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    console.log("session", sessionId);

    // TODO: should check user identity, but this api is used by the agent server
    // so we skip that for now
    const session = await ctx.db.get(sessionId);
    const question = await ctx.db.get(session!.questionId);

    if (!session || !question) {
      throw new Error("Session not found");
    }

    return {
      session_id: sessionId,
      question_title: question.title,
      question_content: question.question,
      agent_thread_id: session.agentThreadId,
      assistant_id: session.assistantId,
      session_status: session.sessionStatus,
    };
  },
});

export const create = userMutation({
  args: {
    questionId: v.id("questions"),
    agentThreadId: v.string(),
    assistantId: v.string(),
    functionName: v.string(),
    inputParameters: v.array(v.string()),
  },
  handler: async (
    ctx,
    { questionId, agentThreadId, assistantId, inputParameters, functionName }
  ) => {
    const sessionId = await ctx.db.insert("sessions", {
      userId: ctx.user.subject,
      questionId,
      agentThreadId,
      assistantId,
      sessionStatus: "not_started",
    });

    // Fetch the question data to get the startingCode
    const question = await ctx.db.get(questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    await ctx.db.insert("editorSnapshots", {
      sessionId,
      editor: {
        language: "python", // You might want to make this dynamic based on the question
        content: question.startingCode || "", // Use startingCode from the question
        lastUpdated: Date.now(),
        functionName: functionName,
        inputParameters: inputParameters,
      },
      terminal: {
        output: "",
        isError: false,
      },
    });

    return sessionId;
  },
});
