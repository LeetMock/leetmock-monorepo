"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";
import { DashboardBreadcrumb } from "../_components/breadcrumb";
import StudyListGrid from "./_components/studyListGrid";
import QuestionPanel from "./_components/questionPanel";




// Main Page Component
const CodingPage = () => {

    return (
        <div className="flex flex-col space-y-6 p-6">
            <DashboardBreadcrumb />
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Study Plan</h1>
                <p className="text-muted-foreground">
                    Choose your learning path and track your progress
                </p>
            </div>


            <StudyListGrid />

            <div className="flex flex-col space-y-4">
                <div className="h-px bg-border" />
            </div>

            <QuestionPanel />
        </div>
    );
};

export default CodingPage;
