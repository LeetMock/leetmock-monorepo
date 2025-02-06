import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "Refresh minutes for yearly plans",
  { hours: 1 },
  internal.userProfiles.refreshMinutesForYearlyPlansInternal
);

// crons.interval(
//   "Check timeout evaluations",
//   { minutes: 1 }, // Run every 5 minutes
//   internal.eval.checkPendingEvaluationsInternal
// );

// crons.interval(
//   "Trigger eval jobs",
//   { minutes: 1 }, // Run every 5 minutes
//   internal.jobs.triggerEvalJobs
// );

crons.interval(
  "Trigger metrics push",
  { minutes: 5 }, // Run every 5 minutes
  internal.actions.sendMetricsToGrafana
);

export default crons;
