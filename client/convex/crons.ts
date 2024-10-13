import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "Refresh minutes for yearly plans",
  { hours: 1 }, // every hour
  internal.userProfiles.refreshMinutesForYearlyPlansInternal,
);

export default crons;