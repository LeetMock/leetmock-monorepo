"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle } from "lucide-react";
import { useTheme } from "next-themes";

// Import components
import QuestionTable from "./components/QuestionTable";
import QuestionFilters from "./components/QuestionFilters";
import QuestionDialog from "./components/QuestionDialog";
import PreviewDialog from "./components/PreviewDialog";
import DeleteDialog from "./components/DeleteDialog";

// Import types and utilities
import {
    BasicInfo,
    EvalMode,
    Filters,
    Parameter,
    QuestionDoc,
    TabId,
    TabValidation,
    Testcase,
    InputParameters
} from "./utils/types";
import { parseValueByType } from "./utils/helpers";
import { formatTestResults } from "./utils/formatters";

export default function QuestionsManagementPage() {
    const router = useRouter();
    const { theme } = useTheme();

    // Fetch questions
    const questions = useQuery(api.questions.getAll);

    // Mutations
    const createQuestion = useMutation(api.questions.createQuestion);
    const updateQuestion = useMutation(api.questions.updateQuestion);
    const deleteQuestion = useMutation(api.questions.deleteQuestion);
    const validateSolution = useAction(api.actions.runGroundTruthTest);
    const generateSolution = useAction(api.actions.generateSolution);
    const importFromLeetCode = useAction(api.actions.scrapeQuestion);
    const generateQuestion = useAction(api.actions.generateQuestion);

    // UI state
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionDoc | null>(null);
    const [previewQuestion, setPreviewQuestion] = useState<QuestionDoc | null>(null);
    const [questionToDelete, setQuestionToDelete] = useState<Id<"questions"> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isSolutionGenerating, setIsSolutionGenerating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Form state
    const [activeTab, setActiveTab] = useState<TabId>("basic");
    const [basicInfo, setBasicInfo] = useState<BasicInfo>({
        title: "",
        category: "",
        difficulty: 1,
        functionName: "",
        question: "",
        companies: "",
        questionSets: "",
    });
    const [parameters, setParameters] = useState<string[]>(["nums"]);
    const [parameterTypes, setParameterTypes] = useState<InputParameters>({
        cpp: { nums: "vector<int>" },
        java: { nums: "int[]" },
        javascript: { nums: "number[]" },
        python: { nums: "List[int]" },
    });
    const [testcases, setTestcases] = useState<Testcase[]>([
        { input: {}, output: null },
    ]);
    const [selectedOutputType, setSelectedOutputType] = useState("number");
    const [evalMode, setEvalMode] = useState<EvalMode>("exactMatch");
    const [validationCode, setValidationCode] = useState("");
    const [validationOutput, setValidationOutput] = useState("");
    const [validationLanguage, setValidationLanguage] = useState("python");
    const [selectedSolutionLanguage, setSelectedSolutionLanguage] = useState("python");
    const [importTitle, setImportTitle] = useState("");

    // Filters
    const [filters, setFilters] = useState<Filters>({
        search: "",
        category: "all",
        difficulty: "all",
    });

    // Tab validation
    const [tabValidation, setTabValidation] = useState<TabValidation>({
        basic: false,
        parameters: false,
        testcases: false,
        validation: true,
    });

    // Derived state
    const validationLanguages = ["python", "javascript", "java", "cpp"];

    // Extract unique categories from questions
    const categories = useMemo(() => {
        if (!questions) return [];
        const allCategories = questions.flatMap(q => q.category || []);
        return Array.from(new Set(allCategories)).sort();
    }, [questions]);

    // Filter questions based on search and filters
    const filteredQuestions = useMemo(() => {
        if (!questions) return [];

        return questions.filter(question => {
            // Filter by search term
            if (filters.search && !question.title.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Filter by category
            if (filters.category !== "all" && !question.category?.includes(filters.category)) {
                return false;
            }

            // Filter by difficulty
            if (filters.difficulty !== "all" && question.difficulty !== parseInt(filters.difficulty)) {
                return false;
            }

            return true;
        });
    }, [questions, filters]);

    // Reset form when editing question changes
    useEffect(() => {
        if (editingQuestion) {
            // Set basic info
            setBasicInfo({
                title: editingQuestion.title || "",
                category: editingQuestion.category?.join(", ") || "",
                difficulty: editingQuestion.difficulty || 1,
                functionName: editingQuestion.functionName || "",
                question: editingQuestion.question || "",
                companies: editingQuestion.companies?.join(", ") || "",
                questionSets: editingQuestion.questionSets?.join(", ") || "",
            });

            // Set parameters
            if (editingQuestion.inputParameters) {
                const params: string[] = Object.keys(editingQuestion.inputParameters.javascript || {});
                setParameters(params);
                setParameterTypes(editingQuestion.inputParameters as InputParameters);
            }

            // Set testcases
            if (editingQuestion.tests) {
                setTestcases(editingQuestion.tests);
            }

            // Set output type
            setSelectedOutputType(editingQuestion.outputParameters || "number");

            // Set eval mode
            setEvalMode(editingQuestion.evalMode || "exactMatch");

            // Set validation code
            if (editingQuestion.solutions) {
                setValidationCode(editingQuestion.solutions[validationLanguage] || "");
            }
        } else {
            resetForm();
        }
    }, [editingQuestion, validationLanguage]);

    // Validate tabs
    useEffect(() => {
        setTabValidation({
            basic: !!basicInfo.title && !!basicInfo.functionName && !!basicInfo.question,
            parameters: parameters.length > 0 && parameters.every(p => !!p),
            testcases: testcases.length > 0,
            validation: true,
        });
    }, [basicInfo, parameters, testcases]);

    // Reset form
    const resetForm = () => {
        setBasicInfo({
            title: "",
            category: "",
            difficulty: 1,
            functionName: "",
            question: "",
            companies: "",
            questionSets: "",
        });
        setParameters(["nums"]);
        setParameterTypes({
            cpp: { nums: "vector<int>" },
            java: { nums: "int[]" },
            javascript: { nums: "number[]" },
            python: { nums: "List[int]" },
        });
        setTestcases([{ input: {}, output: null }]);
        setSelectedOutputType("number");
        setEvalMode("exactMatch");
        setValidationCode("");
        setValidationOutput("");
    };

    // Reset validation states
    const resetValidationStates = () => {
        setValidationOutput("");
    };

    // Handle parameter changes
    const handleAddParameter = () => {
        const newParamName = `param${parameters.length + 1}`;
        setParameters([...parameters, newParamName]);
        setParameterTypes({
            cpp: { ...parameterTypes?.cpp || {}, [newParamName]: "int" },
            java: { ...parameterTypes?.java || {}, [newParamName]: "int" },
            javascript: { ...parameterTypes?.javascript || {}, [newParamName]: "number" },
            python: { ...parameterTypes?.python || {}, [newParamName]: "int" },
        });
    };

    const handleRemoveParameter = (index: number) => {
        const paramName = parameters[index];
        const newParameters = parameters.filter((_, i) => i !== index);

        // Create new parameter types object without the removed parameter
        const newParameterTypes = {
            cpp: { ...parameterTypes?.cpp || {} },
            java: { ...parameterTypes?.java || {} },
            javascript: { ...parameterTypes?.javascript || {} },
            python: { ...parameterTypes?.python || {} },
        };

        delete newParameterTypes.cpp[paramName];
        delete newParameterTypes.java[paramName];
        delete newParameterTypes.javascript[paramName];
        delete newParameterTypes.python[paramName];

        setParameters(newParameters);
        setParameterTypes(newParameterTypes);
    };

    const handleParameterChange = (index: number, newName: string) => {
        const oldName = parameters[index];
        const newParameters = [...parameters];
        newParameters[index] = newName;

        // Create new parameter types with updated key
        const newParameterTypes = {
            cpp: { ...parameterTypes?.cpp || {} },
            java: { ...parameterTypes?.java || {} },
            javascript: { ...parameterTypes?.javascript || {} },
            python: { ...parameterTypes?.python || {} },
        };

        // Copy values from old key to new key
        newParameterTypes.cpp[newName] = newParameterTypes.cpp[oldName];
        newParameterTypes.java[newName] = newParameterTypes.java[oldName];
        newParameterTypes.javascript[newName] = newParameterTypes.javascript[oldName];
        newParameterTypes.python[newName] = newParameterTypes.python[oldName];

        // Delete old keys
        if (oldName !== newName) {
            delete newParameterTypes.cpp[oldName];
            delete newParameterTypes.java[oldName];
            delete newParameterTypes.javascript[oldName];
            delete newParameterTypes.python[oldName];
        }

        setParameters(newParameters);
        setParameterTypes(newParameterTypes);
    };

    const handleParameterTypeChange = (
        paramName: string,
        language: 'cpp' | 'java' | 'javascript' | 'python',
        value: string
    ) => {
        setParameterTypes(prev => {
            // Create a safe copy of prev or initialize if undefined
            const safePrev: InputParameters = prev || {
                cpp: {},
                java: {},
                javascript: {},
                python: {}
            };

            return {
                ...safePrev,
                [language]: {
                    ...(safePrev[language] || {}),
                    [paramName]: value
                }
            };
        });
    };

    // Handle testcase changes
    const handleAddTestcase = () => {
        setTestcases([...testcases, { input: {}, output: null }]);
    };

    const handleTestcaseChange = (index: number, paramName: string, value: string) => {
        const updatedTestcases = [...testcases];

        if (paramName === "output") {
            updatedTestcases[index].output = parseValueByType(value, selectedOutputType);
        } else {
            // Find the parameter to get its type, using optional chaining
            const param = parameterTypes?.[validationLanguage as keyof typeof parameterTypes];
            if (param) {
                const paramType = param[paramName] || "string";
                updatedTestcases[index].input = {
                    ...updatedTestcases[index].input,
                    [paramName]: parseValueByType(value, paramType),
                };
            }
        }

        setTestcases(updatedTestcases);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare data, ensuring parameterTypes is defined
            const questionData = {
                title: basicInfo.title,
                category: basicInfo.category.split(",").map(c => c.trim()).filter(Boolean),
                difficulty: basicInfo.difficulty,
                functionName: basicInfo.functionName,
                question: basicInfo.question,
                companies: basicInfo.companies.split(",").map(c => c.trim()).filter(Boolean),
                questionSets: basicInfo.questionSets.split(",").map(c => c.trim()).filter(Boolean),
                inputParameters: parameterTypes || {
                    cpp: {},
                    java: {},
                    javascript: {},
                    python: {}
                },
                outputParameters: selectedOutputType,
                evalMode,
                tests: testcases,
                solutions: {
                    [validationLanguage]: validationCode,
                },
            };

            if (editingQuestion) {
                // Update existing question
                await updateQuestion({
                    questionId: editingQuestion._id,
                    ...questionData,
                });
                toast.success("Question updated successfully");
            } else {
                // Create new question
                await createQuestion(questionData);
                toast.success("Question created successfully");
            }

            // Close dialog and reset form
            setIsCreateDialogOpen(false);
            setEditingQuestion(null);
            resetForm();
        } catch (error) {
            toast.error("Failed to save question: " + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (id: Id<"questions">) => {
        try {
            await deleteQuestion({ questionId: id });
            toast.success("Question deleted successfully");
            setQuestionToDelete(null);
        } catch (error) {
            toast.error("Failed to delete question: " + error);
        }
    };

    // Handle validation
    const handleRunValidation = async () => {
        if (!validationCode.trim()) {
            toast.error("Please enter code to validate");
            return;
        }

        setIsValidating(true);
        setValidationOutput("Running tests...");

        try {
            const result = await validateSolution({
                code: validationCode,
                language: validationLanguage,
                questionId: editingQuestion?._id as Id<"questions">
            });

            setValidationOutput(formatTestResults(result));
        } catch (error) {
            setValidationOutput(`Error: ${error}`);
            toast.error("Validation failed: " + error);
        } finally {
            setIsValidating(false);
        }
    };

    // Handle solution generation
    const handleGenerateSolution = async () => {
        setIsSolutionGenerating(true);

        try {
            const solution = await generateSolution({
                language: selectedSolutionLanguage,
                functionName: basicInfo.functionName,
                inputParameters: parameterTypes,
                outputType: selectedOutputType,
                questionTitle: basicInfo.title,
                questionContent: basicInfo.question,
            });

            setValidationLanguage(selectedSolutionLanguage);
            setValidationCode(solution.solution);
            toast.success("Solution generated successfully");

            // After generating the solution, switch to the validation tab
            if (isImporting) {
                setActiveTab("validation");
            }
        } catch (error) {
            toast.error("Failed to generate solution: " + error);
        } finally {
            setIsSolutionGenerating(false);
        }
    };

    // Handle import from LeetCode
    const handleImportQuestion = async () => {
        if (!importTitle.trim()) {
            toast.error("Please enter a question title or slug");
            return;
        }

        setIsImporting(true);

        try {
            const importedQuestion = await importFromLeetCode({
                titleSlug: importTitle.trim(),
            });

            // Parse company tags from companyTagStats (it's a JSON string)
            let companies: string[] = [];
            try {
                const companyStats = JSON.parse(importedQuestion.companyTagStats || "{}");
                // Extract company names from all difficulty levels (1, 2, 3)
                const allCompanies = [
                    ...(companyStats["1"] || []),
                    ...(companyStats["2"] || []),
                    ...(companyStats["3"] || [])
                ];
                // Extract unique company names
                companies = Array.from(new Set(allCompanies.map(company => company.name)));
            } catch (e) {
                console.error("Failed to parse company tags:", e);
            }

            // Parse topic tags directly from the topicTags array
            const categories = importedQuestion.topicTags?.map(tag => tag.name) || [];

            // Map difficulty string to number
            const difficultyMap = {
                "Easy": 1,
                "Medium": 2,
                "Hard": 3
            };
            const difficultyLevel = difficultyMap[importedQuestion.difficulty as keyof typeof difficultyMap] || 1;

            // Generate question details using AI
            const generatedDetails = await generateQuestion({
                questionTitle: importedQuestion.questionTitle || "",
                questionContent: importedQuestion.question || "",
            });

            // Update form with imported and generated data
            setBasicInfo({
                title: importedQuestion.questionTitle || "",
                category: categories.join(", ") || "",
                difficulty: difficultyLevel,
                functionName: generatedDetails.functionName || "",
                question: importedQuestion.question || "",
                companies: companies.join(", ") || "",
                questionSets: "", // No question sets from LeetCode
            });

            // Set parameters from generated data
            if (generatedDetails.inputParameters) {
                const params: string[] = Object.keys(generatedDetails.inputParameters.javascript || {});
                setParameters(params);
                setParameterTypes(generatedDetails.inputParameters);
            }

            // Set test cases from generated data
            if (generatedDetails.tests && generatedDetails.tests.length > 0) {
                setTestcases(generatedDetails.tests);
            }

            // Set eval mode from generated data
            if (generatedDetails.evalMode) {
                setEvalMode(generatedDetails.evalMode as EvalMode);
            }

            // Generate solution in the selected language
            if (generatedDetails.functionName) {
                await handleGenerateSolution();
            }

            toast.success("Question imported and enhanced successfully");
            setActiveTab("basic");
        } catch (error) {
            toast.error("Failed to import question: " + error);
        } finally {
            setIsImporting(false);
        }
    };

    // Handle export
    const handleExport = () => {
        if (!questions || questions.length === 0) {
            toast.error("No questions to export");
            return;
        }

        const data = JSON.stringify(questions, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "questions.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Questions exported successfully");
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Questions Management</h1>
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Button onClick={() => handleExport()}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button onClick={() => {
                            setEditingQuestion(null);
                            setIsCreateDialogOpen(true);
                        }}>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Question
                        </Button>
                    </div>
                </div>
            </div>

            <div className="border rounded-lg">
                <QuestionFilters
                    filters={filters}
                    setFilters={setFilters}
                    categories={categories}
                    totalQuestions={questions?.length || 0}
                    filteredCount={filteredQuestions.length}
                />

                <QuestionTable
                    questions={filteredQuestions}
                    onEdit={(question) => {
                        setEditingQuestion(question);
                        setIsCreateDialogOpen(true);
                    }}
                    onPreview={(question) => {
                        setPreviewQuestion(question);
                        setIsPreviewDialogOpen(true);
                    }}
                    onDelete={(id) => setQuestionToDelete(id)}
                />
            </div>

            {/* Question Dialog */}
            <QuestionDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                editingQuestion={editingQuestion}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                importTitle={importTitle}
                setImportTitle={setImportTitle}
                onImport={handleImportQuestion}
                isImporting={isImporting}
                // State
                basicInfo={basicInfo}
                setBasicInfo={setBasicInfo}
                parameters={parameters}
                setParameters={setParameters}
                parameterTypes={parameterTypes}
                setParameterTypes={setParameterTypes}
                testcases={testcases}
                setTestcases={setTestcases}
                selectedOutputType={selectedOutputType}
                setSelectedOutputType={setSelectedOutputType}
                evalMode={evalMode}
                setEvalMode={setEvalMode}
                validationCode={validationCode}
                setValidationCode={setValidationCode}
                validationOutput={validationOutput}
                validationLanguage={validationLanguage}
                setValidationLanguage={setValidationLanguage}
                validationLanguages={validationLanguages}
                isValidating={isValidating}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabValidation={tabValidation}
                // Handlers
                handleAddParameter={handleAddParameter}
                handleRemoveParameter={handleRemoveParameter}
                handleParameterChange={handleParameterChange}
                handleParameterTypeChange={handleParameterTypeChange}
                handleTestcaseChange={handleTestcaseChange}
                handleAddTestcase={handleAddTestcase}
                handleRunValidation={handleRunValidation}
                resetValidationStates={resetValidationStates}
                selectedSolutionLanguage={selectedSolutionLanguage}
                setSelectedSolutionLanguage={setSelectedSolutionLanguage}
                isSolutionGenerating={isSolutionGenerating}
                handleGenerateSolution={handleGenerateSolution}
            />

            {/* Preview Dialog */}
            <PreviewDialog
                question={previewQuestion}
                open={isPreviewDialogOpen}
                onOpenChange={setIsPreviewDialogOpen}
            />

            {/* Delete Dialog */}
            <DeleteDialog
                questionId={questionToDelete}
                onOpenChange={() => setQuestionToDelete(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}