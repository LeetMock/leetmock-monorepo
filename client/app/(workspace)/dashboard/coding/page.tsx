"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { DashboardBreadcrumb } from "../_components/breadcrumb";
import StudyListGrid from "./_components/studyListGrid";
import QuestionPanel from "./_components/questionPanel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import CodeImg from '../../../../public/code.png';
import { StudyPlan } from "./types";
import { useStudyPlanStore } from "@/hooks/use-study-plan-store";

// Main Page Component
const CodingPage = () => {
    const studyPlanQuery = useQuery(api.codingQuestionSet.getStudyPlanByName, { name: "TOP150" });
    const { getStudyPlan, setStudyPlan } = useStudyPlanStore();
    const [studyList, setStudyList] = useState<StudyPlan>([]);

    useEffect(() => {
        // First try to get from cache
        const cachedPlan = getStudyPlan("TOP150");

        if (cachedPlan && cachedPlan.length > 0) {
            setStudyList(cachedPlan);
        } else if (studyPlanQuery) {
            // If not in cache, use the query result
            const studyplan = [{
                icon: CodeImg,
                title: studyPlanQuery.name,
                description: "Must-do List for Interview Prep",
                name: studyPlanQuery.name,
                id: studyPlanQuery._id
            }];

            setStudyList(studyplan);
            setStudyPlan("TOP150", studyplan);
        }
    }, [studyPlanQuery, getStudyPlan, setStudyPlan]);

    return (
        <div className="flex flex-col space-y-6 p-6">
            <DashboardBreadcrumb className="h-2 bg-background/80 rounded-t-md" />
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Study Plan</h1>
                <p className="text-muted-foreground">
                    Choose your learning path and track your progress
                </p>
            </div>

            <StudyListGrid studyLists={studyList} />

            <div className="flex flex-col space-y-4">
                <div className="h-px bg-border" />
            </div>

            <QuestionPanel />
        </div>
    );
};

export default CodingPage;
