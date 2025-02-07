import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

// Create a simple Registry class
class Registry {
  gauges: Gauge[] = [];
  contentType = "text/plain; version=0.0.4";

  async metrics(): Promise<string> {
    return this.gauges
      .map((gauge) => {
        const lines = [
          `# HELP ${gauge.name} ${gauge.help}`,
          `# TYPE ${gauge.name} gauge`,
        ];

        if (Object.keys(gauge.labelValues).length === 0) {
          lines.push(`${gauge.name} ${gauge.value}`);
        } else {
          Object.entries(gauge.labelValues).forEach(([labels, value]) => {
            lines.push(`${gauge.name}{${labels}} ${value}`);
          });
        }
        return lines.join("\n");
      })
      .join("\n\n");
  }
}

// Create a simple Gauge class
class Gauge {
  value: number = 0;
  labelValues: Record<string, number> = {};

  constructor(
    public name: string,
    public help: string
  ) {}

  set(labels: Record<string, string> | number, value?: number) {
    if (typeof labels === "number") {
      this.value = labels;
    } else {
      const labelString = Object.entries(labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(",");
      this.labelValues[labelString] = value!;
    }
  }
}

// Initialize the Registry
const register = new Registry();

// Create metrics
const usersGauge = new Gauge("users", "Current number of users");
register.gauges.push(usersGauge);

const usersByRoleGauge = new Gauge("users_by_role", "Number of users by role");
register.gauges.push(usersByRoleGauge);

const usersBySubscriptionGauge = new Gauge(
  "users_by_subscription",
  "Number of users by subscription tier"
);
register.gauges.push(usersBySubscriptionGauge);

export const updateMetrics = async (ctx: any) => {
  const metrics = await ctx.runQuery(
    internal.userProfiles.getAllUserMetricsInternal
  );

  const totalUsers = Object.values(metrics.usersByRole).reduce(
    (sum: number, count: unknown) => sum + (count as number),
    0
  );
  usersGauge.set(totalUsers);

  Object.entries(metrics.usersByRole).forEach(([role, count]) => {
    usersByRoleGauge.set({ role }, count as number);
  });

  Object.entries(metrics.usersBySubscription).forEach(([tier, count]) => {
    usersBySubscriptionGauge.set({ tier }, count as number);
  });

  return await register.metrics();
};

export const metricsHandler = httpAction(async (ctx, req) => {
  if (req.headers.get("Authorization") !== "Bearer 1234567890") {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const metrics = await updateMetrics(ctx);
  return new Response(metrics, {
    headers: {
      "Content-Type": register.contentType,
    },
  });
});
