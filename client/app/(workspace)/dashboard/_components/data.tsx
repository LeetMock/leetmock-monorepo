import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
  ArchiveIcon,
} from "@radix-ui/react-icons";

export const statuses = [
  {
    value: "backlog",
    label: "Backlog",
    icon: ArchiveIcon,
  },
  {
    value: "not_started",
    label: "Not Started",
    icon: CircleIcon,
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: StopwatchIcon,
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircledIcon,
  },
  {
    value: "failed",
    label: "Failed",
    icon: CrossCircledIcon,
  },
];
export const difficulties = [
  {
    label: "Easy",
    value: "1",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "2",
    icon: ArrowRightIcon,
  },
  {
    label: "Hard",
    value: "3",
    icon: ArrowUpIcon,
  },
];
