import { httpRouter } from "convex/server";
import { stripeWebhookHandler } from "./transactions";
import { metricsHandler } from "./metrics";

const http = httpRouter();

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: stripeWebhookHandler,
});

http.route({
  path: "/prom-metrics",
  method: "GET",
  handler: metricsHandler,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
