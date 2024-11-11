import { isDefined } from "@/lib/utils";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query, userMutation } from "./functions";
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
      event,
    });
  },
});

async function handleContentChangeEvent(
  sessionState: EntWriter<"codeSessionStates">,
  e: Extract<CodeSessionEvent, { type: "content_changed" }>
) {
  const { after } = e.data;

  await sessionState.patch({
    editor: {
      ...sessionState.editor,
      content: after,
      lastUpdated: Date.now(),
    },
  });
}

export const getLatestContentChangeEvent = query({
  args: {
    codeSessionStateId: v.id("codeSessionStates"),
  },
  returns: v.union(
    v.object({
      id: v.id("codeSessionEvents"),
      ts: v.number(),
      event: codeSessionEventSchemas.content_changed,
    }),
    v.null()
  ),
  handler: async (ctx, { codeSessionStateId }) => {
    const event = await getLatestEventByType(ctx, codeSessionStateId, "content_changed");
    console.log("event", event);
    return event;
  },
});

// TODO: add other event queries here ...

async function getLatestEventByType<T extends CodeSessionEventType>(
  ctx: QueryCtx,
  codeSessionStateId: Id<"codeSessionStates">,
  eventType: T
): Promise<
  | {
      id: Id<"codeSessionEvents">;
      ts: number;
      event: Extract<CodeSessionEvent, { type: T }>;
    }
  | undefined
> {
  const event = await ctx
    .table("codeSessionEvents", "by_session_id_and_type", (q) =>
      q.eq("codeSessionStateId", codeSessionStateId).eq("event.type", eventType)
    )
    .order("desc")
    .first();

  if (!isDefined(event)) {
    return undefined;
  }

  return {
    id: event._id,
    ts: event._creationTime,
    event: event.event as unknown as Extract<CodeSessionEvent, { type: T }>,
  };
}
