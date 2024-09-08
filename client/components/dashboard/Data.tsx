import {
    ArrowDownIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    CheckCircledIcon,
    CircleIcon,
    CrossCircledIcon,
    QuestionMarkCircledIcon,
    StopwatchIcon,
} from "@radix-ui/react-icons"

export const statuses = [
    {
        value: "backlog",
        label: "Backlog",
        icon: QuestionMarkCircledIcon,
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
]
export const difficulties = [
    {
        label: "Easy",
        value: "easy",
        icon: ArrowDownIcon,
    },
    {
        label: "Medium",
        value: "medium",
        icon: ArrowRightIcon,
    },
    {
        label: "Hard",
        value: "hard",
        icon: ArrowUpIcon,
    },
]