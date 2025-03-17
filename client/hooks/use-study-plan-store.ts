import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudyPlan } from '@/app/(workspace)/dashboard/coding/types';

interface StudyPlanState {
    studyPlans: Record<string, StudyPlan>;
    setStudyPlan: (name: string, plan: StudyPlan) => void;
    getStudyPlan: (name: string) => StudyPlan | undefined;
}

export const useStudyPlanStore = create<StudyPlanState>()(
    persist(
        (set, get) => ({
            studyPlans: {},
            setStudyPlan: (name, plan) =>
                set((state) => ({
                    studyPlans: {
                        ...state.studyPlans,
                        [name]: plan
                    }
                })),
            getStudyPlan: (name) => get().studyPlans[name],
        }),
        {
            name: 'study-plan-storage',
        }
    )
);