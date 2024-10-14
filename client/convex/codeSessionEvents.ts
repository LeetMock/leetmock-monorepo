import { v } from "convex/values";
import { userMutation } from "./functions";
import { codeSessionEventType } from "./schema";
import { CodeSessionEventType, EntWriter } from "./types";

export const commitCodeSessionEvent = userMutation({
  args: {
    sessionId: v.id("sessions"),
    event: codeSessionEventType,
  },
  handler: async (ctx, { sessionId, event }) => {
    const sessionState = await ctx.table("sessions").getX(sessionId).edgeX("codeSessionState");

    if (event.type === "content_changed") {
      await handleContentChangeEvent(sessionState, event);
    } else {
      // TODO: handle other event types
      throw new Error(`Unsupported event type: ${event.type}`);
    }

    // commit the event to the events table
    await ctx.table("codeSessionEvents").insert({
      codeSessionStateId: sessionState._id,
      acked: false,
      event,
    });
  },
});

async function handleContentChangeEvent(
  sessionState: EntWriter<"codeSessionStates">,
  e: Extract<CodeSessionEventType, { type: "content_changed" }>
) {
  const { content } = e.data;

  await sessionState.patch({
    editor: {
      ...sessionState.editor,
      content,
      lastUpdated: Date.now(),
    },
  });
}
