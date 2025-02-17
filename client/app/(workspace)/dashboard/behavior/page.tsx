"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

import { Id } from "@/convex/_generated/dataModel";
import { useConfig } from "@/hooks/use-config";
import { useUser } from "@clerk/clerk-react";
import { MoveRight } from "lucide-react";
import { useMemo } from "react";
import { DashboardBreadcrumb } from "../_components/breadcrumb";

interface InterviewCardProps {
    activeSessionId: Id<"sessions"> | undefined;
    questionTitle: string | undefined;
}

export function ComingSoon() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-indigo-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
            <div className="text-center space-y-8">
                <div className="animate-pulse">
                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent mb-4">
                        Coming Soon
                    </h1>
                </div>

                <p className="text-xl text-slate-600/90 dark:text-cyan-100/90 font-light">
                    Something amazing is brewing. Stay tuned!
                </p>
            </div>
        </div>
    );
}

const BehaviorPage: React.FC = () => {
    return (
        <div className="flex flex-col">
            <DashboardBreadcrumb className="h-12 px-6 bg-background/80 backdrop-blur-sm rounded-t-md" />
            <div className="flex-1">
                <ComingSoon />
            </div>
        </div>
    );
};

export default BehaviorPage;
