import { v } from "convex/values";
import { mutation, query, userMutation } from "./functions";
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

export const ackCodeSessionEvents = mutation({
  args: {
    eventIds: v.array(v.id("codeSessionEvents")),
  },
  handler: async (ctx, { eventIds }) => {
    const promises = eventIds.map(async (eventId) => {
      try {
        await ctx.table("codeSessionEvents").getX(eventId).patch({
          acked: true,
        });
      } catch (e) {
        console.error(`Error acking event ${eventId}: ${e}`);
      }
    });

    await Promise.all(promises);
  },
});

export const getNextEventBatch = query({
  args: {
    codeSessionStateId: v.id("codeSessionStates"),
    limit: v.number(),
  },
  returns: v.array(
    v.object({
      ts: v.number(),
      event: codeSessionEventType,
    })
  ),
  handler: async (ctx, { codeSessionStateId, limit }) => {
    const events = await ctx
      .table("codeSessionEvents", "by_session_id_and_acked", (q) =>
        q.eq("codeSessionStateId", codeSessionStateId).eq("acked", false)
      )
      .order("asc")
      .take(limit)
      .map(({ _creationTime, event }) => {
        return { ts: _creationTime, event };
      });

    return events;
  },
});
