import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "Refresh minutes for yearly plans",
  { hours: 1 },
  internal.userProfiles.refreshMinutesForYearlyPlansInternal
);

crons.interval(
  "Check pending evaluations",
  { minutes: 5 }, // Run every 5 minutes
  internal.eval.checkPendingEvaluationsInternal
);

export default crons;
