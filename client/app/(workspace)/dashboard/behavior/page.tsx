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

const ComingSoon = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        We&apos;re working hard to bring you system design interview practice. Stay tuned!
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild>
                        <Link href="/dashboard/coding">
                            Try coding interviews <MoveRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

const BehaviorPage = () => {
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
