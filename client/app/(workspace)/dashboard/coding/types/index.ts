import { StaticImageData } from "next/image";

// Type for individual study list item
export interface StudyListItem {
    icon: StaticImageData | string;
    title: string;
    description: string;
    name: string;
    id: string;
}

// Type for the complete study plan (array of study list items)
export type StudyPlan = StudyListItem[]; 