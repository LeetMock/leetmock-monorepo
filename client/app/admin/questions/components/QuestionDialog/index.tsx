"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { BasicInfo, EvalMode, InputParameters, QuestionDoc, TabId, TabValidation, Testcase } from "../../utils/types";
import BasicInfoTab from "./BasicInfoTab";
import ParametersTab from "./ParametersTab";
import TestcasesTab from "./TestcasesTab";
import ValidationTab from "./ValidationTab";
import ImportSection from "../ImportSection";

interface QuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingQuestion: QuestionDoc | null;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isSubmitting: boolean;
    importTitle: string;
    setImportTitle: (title: string) => void;
    onImport: () => Promise<void>;
    isImporting: boolean;
    // State and handlers
    basicInfo: BasicInfo;
    setBasicInfo: React.Dispatch<React.SetStateAction<BasicInfo>>;
    parameters: string[];
    setParameters: React.Dispatch<React.SetStateAction<string[]>>;
    testcases: Testcase[];
    setTestcases: React.Dispatch<React.SetStateAction<Testcase[]>>;
    selectedOutputType: string;
    setSelectedOutputType: React.Dispatch<React.SetStateAction<string>>;
    evalMode: EvalMode;
    setEvalMode: React.Dispatch<React.SetStateAction<EvalMode>>;
    validationCode: string;
    setValidationCode: React.Dispatch<React.SetStateAction<string>>;
    validationOutput: string;
    validationLanguage: string;
    setValidationLanguage: React.Dispatch<React.SetStateAction<string>>;
    validationLanguages: string[];
    isValidating: boolean;
    activeTab: TabId;
    setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
    tabValidation: TabValidation;
    parameterTypes: InputParameters;
    setParameterTypes: React.Dispatch<React.SetStateAction<InputParameters>>;
    // Metadata for special eval modes
    questionMetadata: Record<string, any>;
    // Handlers
    handleAddParameter: () => void;
    handleRemoveParameter: (index: number) => void;
    handleParameterChange: (index: number, newName: string) => void;
    handleParameterTypeChange: (paramName: string, language: 'cpp' | 'java' | 'javascript' | 'python', value: string) => void;
    handleTestcaseChange: (index: number, paramName: string, value: string) => void;
    handleAddTestcase: () => void;
    handleRunValidation: () => Promise<void>;
    resetValidationStates: () => void;
    selectedSolutionLanguage: string;
    setSelectedSolutionLanguage: React.Dispatch<React.SetStateAction<string>>;
    isSolutionGenerating: boolean;
    handleGenerateSolution: () => Promise<void>;
}

export default function QuestionDialog({
    open,
    onOpenChange,
    editingQuestion,
    onSubmit,
    isSubmitting,
    importTitle,
    setImportTitle,
    onImport,
    isImporting,
    // State
    basicInfo,
    setBasicInfo,
    parameters,
    setParameters,
    testcases,
    setTestcases,
    selectedOutputType,
    setSelectedOutputType,
    evalMode,
    setEvalMode,
    validationCode,
    setValidationCode,
    validationOutput,
    validationLanguage,
    setValidationLanguage,
    validationLanguages,
    isValidating,
    activeTab,
    setActiveTab,
    tabValidation,
    parameterTypes,
    setParameterTypes,
    // Metadata
    questionMetadata,
    // Handlers
    handleAddParameter,
    handleRemoveParameter,
    handleParameterChange,
    handleParameterTypeChange,
    handleTestcaseChange,
    handleAddTestcase,
    handleRunValidation,
    resetValidationStates,
    selectedSolutionLanguage,
    setSelectedSolutionLanguage,
    isSolutionGenerating,
    handleGenerateSolution
}: QuestionDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                onOpenChange(open);
                if (!open) {
                    resetValidationStates();
                }
            }}
        >
            <DialogContent className="sm:max-w-[1200px]">
                <DialogHeader>
                    <DialogTitle>
                        {editingQuestion ? "Edit Question" : "Create New Question"}
                    </DialogTitle>
                </DialogHeader>

                {/* Import section */}
                <ImportSection
                    importTitle={importTitle}
                    setImportTitle={setImportTitle}
                    onImport={onImport}
                    isImporting={isImporting}
                />

                <form onSubmit={onSubmit} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabId)} className="w-full">
                        <TabsList>
                            <TabsTrigger value="basic" className="relative">
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger value="parameters" className="relative">
                                Parameters
                            </TabsTrigger>
                            <TabsTrigger value="testcases" className="relative">
                                Test Cases
                            </TabsTrigger>
                            <TabsTrigger value="validation" className="relative">
                                Validation
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic">
                            <BasicInfoTab
                                basicInfo={basicInfo}
                                setBasicInfo={setBasicInfo}
                            />
                        </TabsContent>

                        <TabsContent value="parameters">
                            <ParametersTab
                                parameters={parameters}
                                parameterTypes={parameterTypes}
                                setParameters={setParameters}
                                setParameterTypes={setParameterTypes}
                                selectedOutputType={selectedOutputType}
                                setSelectedOutputType={setSelectedOutputType}
                                evalMode={evalMode}
                                setEvalMode={setEvalMode}
                                handleAddParameter={handleAddParameter}
                                handleRemoveParameter={handleRemoveParameter}
                                handleParameterChange={handleParameterChange}
                                handleParameterTypeChange={handleParameterTypeChange}
                                questionMetadata={questionMetadata}
                            />
                        </TabsContent>

                        <TabsContent value="testcases">
                            <TestcasesTab
                                testcases={testcases}
                                setTestcases={setTestcases}
                                parameters={parameters}
                                parameterTypes={parameterTypes}
                                selectedOutputType={selectedOutputType}
                                handleTestcaseChange={handleTestcaseChange}
                                handleAddTestcase={handleAddTestcase}
                            />
                        </TabsContent>

                        <TabsContent value="validation">
                            <ValidationTab
                                validationCode={validationCode}
                                setValidationCode={setValidationCode}
                                validationOutput={validationOutput}
                                validationLanguage={validationLanguage}
                                setValidationLanguage={setValidationLanguage}
                                validationLanguages={validationLanguages}
                                isValidating={isValidating}
                                handleRunValidation={handleRunValidation}
                                selectedSolutionLanguage={selectedSolutionLanguage}
                                setSelectedSolutionLanguage={setSelectedSolutionLanguage}
                                isSolutionGenerating={isSolutionGenerating}
                                handleGenerateSolution={handleGenerateSolution}
                            />
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-between items-center gap-3">
                        <div className="text-sm text-muted-foreground">
                            {!tabValidation.basic && "* Complete Basic Info"}
                            {!tabValidation.parameters && "* Add Parameters"}
                            {!tabValidation.testcases && "* Add Test Cases"}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editingQuestion ? "Update" : "Create"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 