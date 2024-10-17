import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query, userMutation } from "./functions";
import {
  CodeSessionEvent,
  codeSessionEventSchema,
  codeSessionEventSchemas,
  CodeSessionEventType,
  EntWriter,
  QueryCtx,
} from "./types";

export const commitCodeSessionEvent = userMutation({
  args: {
    sessionId: v.id("sessions"),
    event: codeSessionEventSchema,
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
  e: Extract<CodeSessionEvent, { type: "content_changed" }>
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

export const ackCodeSessionEvent = mutation({
  args: {
    eventId: v.id("codeSessionEvents"),
  },
  handler: async (ctx, { eventId }) => {
    await ctx.table("codeSessionEvents").getX(eventId).patch({
      acked: true,
    });
  },
});

export const getNextContentChangeEvent = query({
  args: {
    codeSessionStateId: v.id("codeSessionStates"),
  },
  returns: v.optional(
    v.object({
      id: v.id("codeSessionEvents"),
      ts: v.number(),
      acked: v.boolean(),
      event: codeSessionEventSchemas.content_changed,
    })
  ),
  handler: async (ctx, { codeSessionStateId }) => {
    return await getNextEventByType(ctx, codeSessionStateId, "content_changed");
  },
});

// TODO: add other event queries here ...

async function getNextEventByType<T extends CodeSessionEventType>(
  ctx: QueryCtx,
  codeSessionStateId: Id<"codeSessionStates">,
  eventType: T
): Promise<
  | {
      id: Id<"codeSessionEvents">;
      ts: number;
      event: Extract<CodeSessionEvent, { type: T }>;
      acked: boolean;
    }
  | undefined
> {
  const event = await ctx
    .table("codeSessionEvents", "by_session_id_and_acked_and_type", (q) =>
      q.eq("codeSessionStateId", codeSessionStateId).eq("acked", false).eq("event.type", eventType)
    )
    .order("asc")
    .first();

  if (!event) {
    return undefined;
  }

  return {
    id: event._id,
    ts: event._creationTime,
    event: event.event as unknown as Extract<CodeSessionEvent, { type: T }>,
    acked: event.acked,
  };
}
