import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";
import migrations from "@convex-dev/migrations/convex.config";

const app = defineApp();
app.use(migrations);
app.use(aggregate, { name: "userMetricsAggregate" });
app.use(aggregate, { name: "userSubscriptionMetricsAggregate" });
app.use(aggregate, { name: "sessionMetricsAggregate" });
export default app;