"use client"

import Image from "next/image"
import Link from "next/link"
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    CircleUser,
    Copy,
    CreditCard,
    File,
    Home,
    LineChart,
    ListFilter,
    Menu,
    MoreVertical,
    Package,
    Package2,
    PanelLeft,
    Search,
    Settings,
    ShoppingCart,
    Truck,
    Users,
    Users2,
} from "lucide-react"
import { dark } from "@clerk/themes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataTable } from "@/components/dashboard/DataTable"
import { columns, SessionDoc } from "@/components/dashboard/Columns"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import { Doc, Id } from "@/convex/_generated/dataModel"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ThemeToggleButton } from "@/components/ThemeToggleButton"
import { UserButton, useUser } from "@clerk/clerk-react"
import { useTheme } from "next-themes"
import { PersonIcon } from "@radix-ui/react-icons";

export const description =
    "A products dashboard with a sidebar navigation and a main content area. The dashboard has a header with a search input and a user menu. The sidebar has a logo, navigation links, and a card with a call to action. The main content area shows an empty state with a call to action."




interface InterviewCardProps {
    resume: boolean;
    sessionId: Id<"sessions"> | undefined;
}

const InterviewCard = ({ resume, sessionId }: InterviewCardProps) => {
    return (
        <Card
            className="col-span-full relative overflow-hidden" x-chunk="dashboard-05-chunk-0"
        >
            <Image
                src="/coding.jpg"
                alt="Coding background"
                fill
                sizes="100vw"
                style={{ objectFit: 'cover' }}
                className="opacity-15"
                priority
            />
            <div className="relative z-10">
                <CardHeader className="pb-3">
                    <CardTitle>{resume ? "Resume" : "Start"} Interview</CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                        {resume ? "Resume the interview" : "Start a mock interview with our AI interviewer!"}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end gap-4">
                    {resume ? (
                        <Link href={`/interview/${sessionId}`} passHref>
                            <Button size="lg">Resume Interview</Button>
                        </Link>
                    ) : (
                        <Link href={`/problems`} passHref>
                            <Button size="lg">Start Interview</Button>
                        </Link>
                    )}
                </CardFooter>
            </div>
        </Card>
    )
}

const Dashboard: React.FC = () => {
    const { theme } = useTheme();
    const { user } = useUser();
    const sessions = useQuery(api.sessions.getByUserId, { userId: user!.id });
    if (sessions === undefined) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>
    }

    //TODO: this needs to be "in_progress"
    const sessionInProgress = sessions.find((session) => session.sessionStatus === "not_started");
    const resume = sessionInProgress ? true : false;
    const sessionId = sessionInProgress ? sessionInProgress._id : undefined;

    console.log(sessions)
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Package2 className="h-6 w-6" />
                            <span className="">LeetMock</span>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <Link
                                href="#"
                                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
                            >
                                <PersonIcon className="h-4 w-4" />
                                Interviews
                                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                    {sessions.length}
                                </Badge>
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Settings className="h-4 w-4" />
                                Settings{" "}
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-auto p-4">
                        <Card x-chunk="dashboard-02-chunk-0">
                            <CardHeader className="p-2 pt-0 md:p-4">
                                <CardTitle>Upgrade to Pro</CardTitle>
                                <CardDescription>
                                    Unlock all features and get more interview time now!
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                                <Button size="sm" className="w-full">
                                    Upgrade
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link
                                    href="#"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                                >
                                    <PersonIcon className="h-5 w-5" />
                                    Interviews
                                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                        {sessions.length}
                                    </Badge>
                                </Link>
                                <Link
                                    href="#"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Settings className="h-5 w-5" />
                                    Settings
                                </Link>
                            </nav>
                            <div className="mt-auto">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Upgrade to Pro</CardTitle>
                                        <CardDescription>
                                            Unlock all features and get unlimited access to our
                                            support team.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button size="sm" className="w-full">
                                            Upgrade
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1 p-4">
                        <Alert>
                            <AlertDescription>
                                🚀 Upgrade to Pro to get more interview time! 🚀
                            </AlertDescription>
                        </Alert>
                    </div>
                    <ThemeToggleButton variant="ghost" />
                    <UserButton
                        appearance={{
                            baseTheme: theme === "dark" ? dark : undefined,
                        }}
                    />

                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-2 mt-4">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                            <InterviewCard resume={resume} sessionId={sessionId} />
                        </div>

                        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex ">
                            <DataTable data={sessions as SessionDoc[]} columns={columns} />
                        </div>
                    </div>
                </main>
            </div >
        </div >
    )
}

export default Dashboard;