import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();
app.use(aggregate, { name: "userMetricsAggregate" });
app.use(aggregate, { name: "userSubscriptionMetricsAggregate" });
export default app;