import { httpRouter } from "convex/server";
import { stripeWebhookHandler } from "./transactions";

const http = httpRouter();

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: stripeWebhookHandler,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
