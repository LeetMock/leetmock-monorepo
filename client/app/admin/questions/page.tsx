"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation, useAction } from "convex/react";
import { PlusCircle, Pencil, Trash2, Loader2, Eye, Search, Download, ImportIcon, Sparkles, Play } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import TurndownService from "turndown";
import { ScrollArea } from "@/components/ui/scroll-area";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";


interface Parameter {
    name: string;
    types: {
        cpp: string;
        java: string;
        javascript: string;
        python: string;
    };
}

interface Testcase {
    input: any;
    output: any;
}

interface Filters {
    search: string;
    category: string;
    difficulty: string;
}

interface OutputTypeOption {
    value: string;
    label: string;
}

interface TabValidation {
    basic: boolean;
    parameters: boolean;
    testcases: boolean;
    validation: boolean;
}

type TabId = keyof TabValidation;

// Update the BasicInfo interface to reflect these fields as strings (for input)
interface BasicInfo {
    title: string;
    category: string;  // Will be comma-separated in the UI, converted to array on submit
    difficulty: number;
    functionName: string;
    question: string;
    companies: string;  // Will be comma-separated in the UI, converted to array on submit
    questionSets: string;  // Will be comma-separated in the UI, converted to array on submit
}

// Add this near other interfaces
type EvalMode = "exactMatch" | "listNodeIter" | "sortedMatch";

const formatQuestionContent = (htmlContent: string) => {
    const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        br: "  \n",
    });

    let markdownContent = turndownService.turndown(htmlContent);

    // Post-processing
    return markdownContent
        .replace(/\n/g, "\n\n")
        .replace(/\n\n(\*\*(?:Input|Output|Explanation|Example):?\*\*)/g, "\n\n\n$1")
        .replace(/\n{3,}/g, "\n\n");
};

// Add this helper function near other utility functions
const formatTestResults = (results: any[]) => {
    // Overview section
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const overview = `Test Summary:\n` +
        `${passedTests}/${totalTests} tests passed\n` +
        `${'-'.repeat(20)}\n`;

    // Detailed results
    const details = results.map((result, index) => {
        const status = result.passed ? '✓ PASS' : '✗ FAIL';
        const statusClass = result.passed ? 'color: #22c55e' : 'color: #ef4444';

        return `Test Case ${result.caseNumber}: ${status}\n` +
            `Input: ${JSON.stringify(result.input)}\n` +
            `Expected: ${JSON.stringify(result.expected)}\n` +
            (result.error ? `Error: ${result.error}\n` :
                `Actual: ${JSON.stringify(result.actual)}\n`) +
            `${'-'.repeat(20)}\n`;
    }).join('\n');

    return `${overview}\n${details}`;
};

export default function QuestionsPage() {
    const router = useRouter();
    const questions = useQuery(api.questions.getAll);
    const createQuestion = useMutation(api.questions.createQuestion);
    const updateQuestion = useMutation(api.questions.updateQuestion);
    const deleteQuestion = useMutation(api.questions.deleteQuestion);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Doc<"questions"> | null>(null);
    const [previewQuestion, setPreviewQuestion] = useState<Doc<"questions"> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationCode, setValidationCode] = useState<string>("");
    const [validationOutput, setValidationOutput] = useState<string>("");
    const [isValidating, setIsValidating] = useState(false);
    const [testcases, setTestcases] = useState<Testcase[]>([
        { input: {}, output: null },
    ]);
    const [validationLanguages, setValidationLanguages] = useState<string[]>([]);
    const [parameters, setParameters] = useState<Parameter[]>([
        {
            name: "",
            types: {
                cpp: "string",
                java: "String",
                javascript: "string",
                python: "str"
            }
        }
    ]);
    const [filters, setFilters] = useState<Filters>({
        search: "",
        category: "all",
        difficulty: "all",
    });
    const [selectedOutputType, setSelectedOutputType] = useState<string>("number");
    const [questionToDelete, setQuestionToDelete] = useState<Id<"questions"> | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>("basic");
    const [tabValidation, setTabValidation] = useState<TabValidation>({
        basic: false,
        parameters: false,
        testcases: false,
        validation: false,
    });

    // Add this state near other state declarations
    const [basicInfo, setBasicInfo] = useState<BasicInfo>({
        title: editingQuestion?.title || "",
        category: editingQuestion?.category?.join(", ") || "",
        difficulty: editingQuestion?.difficulty || 1,
        functionName: editingQuestion?.functionName || "",
        question: editingQuestion?.question || "",
        companies: Array.isArray(editingQuestion?.companies) ? editingQuestion.companies.join(", ") : "",
        questionSets: Array.isArray(editingQuestion?.questionSets) ? editingQuestion.questionSets.join(", ") : "",
    });

    // Add this near other state declarations
    const [evalMode, setEvalMode] = useState<EvalMode>("exactMatch");

    // Add this state near other state declarations
    const [validationLanguage, setValidationLanguage] = useState<string>("python");

    // Add this query to get user profile
    const userProfile = useQuery(api.userProfiles.getUserProfile);

    const { theme } = useTheme();

    const categories = useMemo(() => {
        if (!questions) return [];
        const categorySet = new Set<string>();
        questions.forEach(question => {
            question.category?.forEach(cat => categorySet.add(cat));
        });
        return Array.from(categorySet);
    }, [questions]);

    const filteredQuestions = useMemo(() => {
        if (!questions) return [];

        return questions.filter(question => {
            const matchesSearch = question.title.toLowerCase().includes(filters.search.toLowerCase());

            const matchesCategory = filters.category === "all" ||
                question.category?.includes(filters.category);

            const matchesDifficulty = filters.difficulty === "all" ||
                question.difficulty === Number(filters.difficulty);

            return matchesSearch && matchesCategory && matchesDifficulty;
        });
    }, [questions, filters]);

    const runGroundTruthTest = useAction(api.actions.runGroundTruthTest);

    const validateBasicInfo = (formData: FormData): boolean => {
        const title = formData.get("title") as string;
        const category = formData.get("category") as string;
        const difficulty = formData.get("difficulty") as string;
        const functionName = formData.get("functionName") as string;
        const question = formData.get("question") as string;

        return !!(title && category && difficulty && functionName && question);
    };

    const validateParameters = (): boolean => {
        return parameters.every(param =>
            param.name && param.types.cpp && param.types.java &&
            param.types.javascript && param.types.python
        ) && selectedOutputType !== "";
    };

    const validateTestcases = (): boolean => {
        return testcases.length > 0 && testcases.every(testcase =>
            Object.keys(testcase.input).length > 0 && testcase.output !== null
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Use basicInfo state instead of form data
        // Only check required fields (title, category, difficulty, functionName, question)
        const isBasicValid = basicInfo.title &&
            basicInfo.category &&
            basicInfo.difficulty &&
            basicInfo.functionName &&
            basicInfo.question;
        const isParametersValid = validateParameters();
        const isTestcasesValid = validateTestcases();

        setTabValidation({
            basic: !!isBasicValid,
            parameters: isParametersValid,
            testcases: isTestcasesValid,
            validation: false,
        });

        if (!isBasicValid || !isParametersValid || !isTestcasesValid) {
            // Find the first invalid tab and switch to it
            const firstInvalidTab = ["basic", "parameters", "testcases"].find(
                tab => !tabValidation[tab as TabId]
            ) as TabId;
            setActiveTab(firstInvalidTab);
            toast.error("Please complete all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const questionData = {
                title: basicInfo.title,
                difficulty: basicInfo.difficulty,
                question: basicInfo.question,
                functionName: basicInfo.functionName,
                category: basicInfo.category.split(",").map(c => c.trim()).filter(Boolean),
                companies: basicInfo.companies.split(",").map(c => c.trim()).filter(Boolean),
                questionSets: basicInfo.questionSets.split(",").map(q => q.trim()).filter(Boolean),
                tests: testcases,
                solutions: {
                    ...editingQuestion?.solutions,
                    [validationLanguage]: validationCode
                },
                inputParameters: {
                    cpp: parameters.reduce((acc, param) => {
                        acc[param.name] = param.types.cpp;
                        return acc;
                    }, {} as Record<string, string>),
                    java: parameters.reduce((acc, param) => {
                        acc[param.name] = param.types.java;
                        return acc;
                    }, {} as Record<string, string>),
                    javascript: parameters.reduce((acc, param) => {
                        acc[param.name] = param.types.javascript;
                        return acc;
                    }, {} as Record<string, string>),
                    python: parameters.reduce((acc, param) => {
                        acc[param.name] = param.types.python;
                        return acc;
                    }, {} as Record<string, string>),
                },
                outputParameters: selectedOutputType,
                evalMode: evalMode,
                metaData: {},
            };

            if (editingQuestion) {
                await updateQuestion({
                    questionId: editingQuestion._id,
                    ...questionData
                });
                toast.success("Question updated successfully");
            } else {
                await createQuestion(questionData);
                setIsCreateDialogOpen(false);
                setEditingQuestion(null);
            }
        } catch (error) {
            toast.error("Failed to save question, " + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (questionId: Id<"questions">) => {
        try {
            await deleteQuestion({ questionId });
            toast.success("Question deleted successfully");
            setQuestionToDelete(null);
        } catch (error) {
            toast.error("Failed to delete question");
        }
    };

    const handleAddTestcase = () => {
        setTestcases([...testcases, { input: {}, output: null }]);
    };

    const parseValueByType = (value: string, type: string) => {
        try {
            // Handle array/list types first
            if (type.includes("List[") || type.includes("[]") || type.includes("vector")) {
                // If the value is already an array (from direct input), return it
                if (Array.isArray(value)) return value;

                // If it's an empty array string, return empty array
                if (value === "[]") return [];

                // Try to parse JSON array
                try {
                    return JSON.parse(value);
                } catch (e) {
                    // If parsing fails, return empty array
                    return [];
                }
            }

            // Handle scalar types
            if (type.includes("integer") || type.includes("int")) {
                return parseInt(value, 10);
            } else if (type.includes("float") || type.includes("Float")) {
                return parseFloat(value);
            } else if (type.includes("boolean") || type.includes("bool")) {
                return value.toLowerCase() === "true";
            }
            return value; // Default to string
        } catch (error) {
            return value; // Return original value if parsing fails
        }
    };

    const handleTestcaseChange = (index: number, paramName: string, value: string) => {
        const updatedTestcases = [...testcases];
        if (paramName === "output") {
            updatedTestcases[index].output = parseValueByType(value, selectedOutputType);
        } else {
            const parameter = parameters.find(p => p.name === paramName);
            if (parameter) {
                // Allow negative sign input
                if (value === "-" || value === "") {
                    updatedTestcases[index].input = {
                        ...updatedTestcases[index].input,
                        [paramName]: value
                    };
                } else {
                    const paramType = parameter.types[validationLanguage];
                    updatedTestcases[index].input = {
                        ...updatedTestcases[index].input,
                        [paramName]: parseValueByType(value, paramType)
                    };
                }
            }
        }
        setTestcases(updatedTestcases);
    };

    const formatJSON = (obj: any): string => {
        return JSON.stringify(obj, null, 2);
    };

    const handleParameterChange = (index: number, field: "name" | "type", value: string) => {
        const updatedParams = [...parameters];
        if (field === "name") {
            updatedParams[index].name = value;
        } else if (field === "type") {
            const typeMap: Record<string, { cpp: string; java: string; javascript: string; python: string }> = {
                "number": {
                    cpp: "int",
                    java: "int",
                    javascript: "number",
                    python: "int"
                },
                "string": {
                    cpp: "string",
                    java: "String",
                    javascript: "string",
                    python: "str"
                },
                "boolean": {
                    cpp: "bool",
                    java: "boolean",
                    javascript: "boolean",
                    python: "bool"
                },
                "array": {
                    cpp: "vector<int>",
                    java: "int[]",
                    javascript: "number[]",
                    python: "List[int]"
                }
            };

            updatedParams[index].types = typeMap[value];
        }
        setParameters(updatedParams);

        // Update testcases input structure when parameters change
        const updatedTestcases = testcases.map(testcase => {
            const newInput: Record<string, any> = {};
            updatedParams.forEach(param => {
                newInput[param.name] = testcase.input[param.name] || getDefaultValue(getGenericType(param.types));
            });
            return { ...testcase, input: newInput };
        });
        setTestcases(updatedTestcases);
    };

    const getDefaultValue = (type: string) => {
        switch (type) {
            case "number":
                return 0;
            case "string":
                return "";
            case "boolean":
                return false;
            case "number[]":
            case "string[]":
                return [];
            default:
                return null;
        }
    };

    const handleAddParameter = () => {
        setParameters([...parameters, { name: "", types: { cpp: "string", java: "String", javascript: "string", python: "str" } }]);
    };

    const handleRemoveParameter = (index: number) => {
        const updatedParams = parameters.filter((_, i) => i !== index);
        setParameters(updatedParams);
    };

    const handleParameterTypeChange = (
        index: number,
        language: 'cpp' | 'java' | 'javascript' | 'python',
        value: string
    ) => {
        const updatedParams = [...parameters];
        updatedParams[index].types[language] = value;
        setParameters(updatedParams);
    };

    // Add this helper function to map language-specific types to generic types
    const getGenericType = (types: { cpp: string; java: string; javascript: string; python: string }): string => {
        // Map language-specific types to generic types
        if (types.javascript === "number" || types.cpp === "int") return "number";
        if (types.javascript === "string" || types.cpp === "string") return "string";
        if (types.javascript === "boolean" || types.cpp === "bool") return "boolean";
        if (types.javascript.includes("[]") || types.cpp.includes("vector")) return "array";
        return "any";
    };

    const commonOutputTypes: OutputTypeOption[] = [
        { value: "number", label: "integer" },
        { value: "List[float]", label: "List[float]" },
        { value: "List[integer]", label: "List[integer]" },
        { value: "string", label: "string" },
        { value: "float", label: "float" },
        { value: "boolean", label: "boolean" },
        { value: "List[string]", label: "List[string]" },
        { value: "List[boolean]", label: "List[boolean]" },
        { value: "custom", label: "Custom Type" },
    ];

    useEffect(() => {
        if (editingQuestion) {
            setSelectedOutputType(editingQuestion.outputParameters);
        } else {
            setSelectedOutputType("number");
        }
    }, [editingQuestion]);

    // When initializing the state from an existing question, handle all three fields
    useEffect(() => {
        if (editingQuestion) {
            // Set basic info
            setBasicInfo({
                title: editingQuestion.title,
                category: editingQuestion.category?.join(", ") || "",
                difficulty: editingQuestion.difficulty,
                functionName: editingQuestion.functionName,
                question: editingQuestion.question,
                companies: Array.isArray(editingQuestion.companies) ? editingQuestion.companies.join(", ") : "",
                questionSets: Array.isArray(editingQuestion.questionSets) ? editingQuestion.questionSets.join(", ") : "",
            });

            // Set parameters with null check
            if (editingQuestion.inputParameters && editingQuestion.inputParameters.cpp) {
                const params = Object.entries(editingQuestion.inputParameters.cpp).map(([name, type]) => ({
                    name,
                    types: {
                        cpp: editingQuestion.inputParameters.cpp[name],
                        java: editingQuestion.inputParameters.java[name],
                        javascript: editingQuestion.inputParameters.javascript[name],
                        python: editingQuestion.inputParameters.python[name],
                    }
                }));
                setParameters(params);
            }

            // Set test cases
            if (editingQuestion.tests) {
                setTestcases(editingQuestion.tests);
            }

            // Set output type
            setSelectedOutputType(editingQuestion.outputParameters);

            // Set eval mode
            setEvalMode(editingQuestion.evalMode);

            // Set available validation languages
            if (editingQuestion.solutions) {
                setValidationLanguages(Object.keys(editingQuestion.solutions));
                // Set default language if available
                if (Object.keys(editingQuestion.solutions).length > 0) {
                    const defaultLang = Object.keys(editingQuestion.solutions)[0];
                    setValidationLanguage(defaultLang);
                    setValidationCode(editingQuestion.solutions[defaultLang] || "");
                }
            }
        } else {
            // Reset all states to default
            setBasicInfo({
                title: "",
                category: "",
                difficulty: 1,
                functionName: "",
                question: "",
                companies: "",
                questionSets: "",
            });
            setParameters([{
                name: "",
                types: {
                    cpp: "string",
                    java: "String",
                    javascript: "string",
                    python: "str"
                }
            }]);
            setTestcases([{ input: {}, output: null }]);
            setSelectedOutputType("number");
            setEvalMode("exactMatch");
        }
    }, [editingQuestion]);

    // Add this effect to check admin role
    useEffect(() => {
        if (userProfile && userProfile.profile?.role !== "admin") {
            toast.error("Only administrators can access this page");
            router.push("/dashboard");
        }
    }, [userProfile, router]);

    // Add loading state while checking permissions
    if (!userProfile) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (userProfile.profile?.role !== "admin") {
        return null;
    }

    // Add this function to handle the export
    const handleExport = () => {
        const questionsData = questions?.map(q => ({
            category: q.category,
            difficulty: q.difficulty,
            evalMode: q.evalMode,
            question: q.question,
            functionName: q.functionName,
            inputParameters: q.inputParameters,
            outputParameters: q.outputParameters,
            tests: q.tests,
            title: q.title,
            metaData: q.metaData || {},
            solutions: q.solutions || {}
        }));

        // Create a Blob with the JSON data
        const blob = new Blob([JSON.stringify(questionsData, null, 2)], { type: 'application/json' });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'selected_questions.json';

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    // Update the validation output setting in handleRunValidation
    const handleRunValidation = async () => {
        if (!validationCode.trim()) {
            toast.error("Please enter validation code");
            return;
        }

        setIsValidating(true);
        try {
            const results = await runGroundTruthTest({
                code: validationCode,
                language: validationLanguage,
                questionId: editingQuestion?._id as Id<"questions">
            });

            setValidationOutput(formatTestResults(results));
        } catch (error) {
            toast.error("Validation failed: " + error);
            setValidationOutput(String(error));
        } finally {
            setIsValidating(false);
        }
    };

    const resetValidationStates = () => {
        setValidationCode("");
        setValidationOutput("");
        setValidationLanguage("python");
    };

    // Add this state for the import title
    const [importTitle, setImportTitle] = useState<string>("");
    const [isImporting, setIsImporting] = useState<boolean>(false);

    // Add this action
    const scrapeQuestion = useAction(api.actions.scrapeQuestion);
    const generateQuestion = useAction(api.actions.generateQuestion);


    // Add this function to handle importing a question
    const handleImportQuestion = async () => {
        if (!importTitle.trim()) {
            toast.error("Please enter a question title to import");
            return;
        }

        setIsImporting(true);
        try {
            const questionData = await scrapeQuestion({ titleSlug: importTitle });

            // Parse company tags if available
            let companies = "";
            try {
                if (questionData.companyTagStats) {
                    // The companyTagStats is a JSON string with a structure like:
                    // {"1": [{"name": "Google", ...}, {"name": "Amazon", ...}]}
                    const companyStats = JSON.parse(questionData.companyTagStats);

                    // Extract company names from the first array (key "1")
                    if (companyStats["1"] && Array.isArray(companyStats["1"])) {
                        companies = companyStats["1"]
                            .map((tag: any) => tag.name)
                            .join(", ");
                    }
                }
            } catch (e) {
                console.error("Error parsing company tags:", e);
            }

            // Parse topic tags
            const categories = questionData.topicTags
                .map((tag: any) => tag.name)
                .join(", ");

            // Map difficulty level
            const difficultyMap: Record<string, number> = {
                "Easy": 1,
                "Medium": 2,
                "Hard": 3
            };

            // Generate additional question data using AI
            const generatedData = await generateQuestion({
                questionTitle: questionData.questionTitle,
                questionContent: questionData.question
            });

            // Update basic info state
            setBasicInfo({
                title: questionData.questionTitle || importTitle,
                category: categories || "",
                difficulty: difficultyMap[questionData.difficulty] || 1,
                functionName: generatedData.functionName,
                question: questionData.question || "",
                companies: companies,
                questionSets: ""  // No direct mapping for this
            });

            // Update parameters state
            if (generatedData.inputParameters) {
                const params = Object.entries(generatedData.inputParameters.cpp || {}).map(([name, type]) => ({
                    name,
                    types: {
                        cpp: generatedData.inputParameters.cpp[name],
                        java: generatedData.inputParameters.java[name],
                        javascript: generatedData.inputParameters.javascript[name],
                        python: generatedData.inputParameters.python[name],
                    }
                }));
                setParameters(params);
            }

            // Update test cases state
            if (generatedData.tests && generatedData.tests.length > 0) {
                setTestcases(generatedData.tests);
            }

            // Update eval mode
            setEvalMode(generatedData.evalMode as EvalMode);

            toast.success("Question imported successfully");

            // Switch to the basic tab to show the imported data
            setActiveTab("basic");

        } catch (error) {
            console.error("Error importing question:", error);
            toast.error("Failed to import question: " + error);
        } finally {
            setIsImporting(false);
        }
    };

    // Helper function to generate a function name from the title
    const generateFunctionName = (title: string): string => {
        if (!title) return "";

        // Convert "Two Sum" to "twoSum"
        return title
            .toLowerCase()
            .replace(/[^\w\s]/g, '')  // Remove special characters
            .split(/\s+/)  // Split by whitespace
            .map((word, index) =>
                index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join('');
    };

    // Add these state variables
    const [isSolutionGenerating, setIsSolutionGenerating] = useState<boolean>(false);
    const [selectedSolutionLanguage, setSelectedSolutionLanguage] = useState<string>("python");

    // Add this action
    const generateSolution = useAction(api.actions.generateSolution);

    // Add this function to handle solution generation
    const handleGenerateSolution = async () => {
        if (!basicInfo.title || !basicInfo.question || !basicInfo.functionName) {
            toast.error("Please fill in the basic question information first");
            return;
        }

        if (parameters.length === 0 || !parameters[0].name) {
            toast.error("Please define at least one parameter");
            return;
        }

        setIsSolutionGenerating(true);

        try {
            const result = await generateSolution({
                questionTitle: basicInfo.title,
                questionContent: basicInfo.question,
                functionName: basicInfo.functionName,
                inputParameters: parameters.reduce((acc, param) => {
                    if (!acc.cpp) acc.cpp = {};
                    if (!acc.java) acc.java = {};
                    if (!acc.javascript) acc.javascript = {};
                    if (!acc.python) acc.python = {};

                    acc.cpp[param.name] = param.types.cpp;
                    acc.java[param.name] = param.types.java;
                    acc.javascript[param.name] = param.types.javascript;
                    acc.python[param.name] = param.types.python;

                    return acc;
                }, {} as Record<string, Record<string, string>>),
                outputType: selectedOutputType,
                language: selectedSolutionLanguage
            });

            // Set the validation code with the generated solution
            setValidationCode(result.solution);
            setValidationLanguage(selectedSolutionLanguage);

            // Switch to validation tab to show the result
            setActiveTab("validation");

            toast.success("Solution generated successfully");
        } catch (error) {
            toast.error("Failed to generate solution: " + error);
        } finally {
            setIsSolutionGenerating(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Questions Management</h1>
                <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                    setIsCreateDialogOpen(open);
                    if (!open) {
                        setEditingQuestion(null);
                        resetValidationStates();
                    }
                }}>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <Button onClick={() => handleExport()}>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <DialogTrigger asChild>
                                <Button onClick={() => setEditingQuestion(null)}>
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Question
                                </Button>
                            </DialogTrigger>
                        </div>
                    </div>
                    <DialogContent className="sm:max-w-[1200px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingQuestion ? "Edit Question" : "Create New Question"}
                            </DialogTitle>
                        </DialogHeader>

                        {/* Add import section at the top */}
                        <div className="flex items-center gap-2 mb-4 p-3 border rounded-md bg-muted/30">
                            <div className="flex-1">
                                <Label htmlFor="importTitle">Import from LeetCode</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        id="importTitle"
                                        placeholder="Enter question title or slug (e.g., 'two-sum')"
                                        value={importTitle}
                                        onChange={(e) => setImportTitle(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleImportQuestion}
                                        disabled={isImporting}
                                    >
                                        {isImporting ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <ImportIcon className="h-4 w-4 mr-2" />
                                        )}
                                        Import
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Enter a LeetCode question title to automatically import its details
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                <TabsContent value="basic" className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={basicInfo.title}
                                            onChange={(e) => setBasicInfo(prev => ({ ...prev, title: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category (comma separated)</Label>
                                        <Input
                                            id="category"
                                            name="category"
                                            value={basicInfo.category}
                                            onChange={(e) => setBasicInfo(prev => ({ ...prev, category: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="companies">Companies (comma separated, optional)</Label>
                                        <Input
                                            id="companies"
                                            name="companies"
                                            value={basicInfo.companies}
                                            onChange={(e) => setBasicInfo(prev => ({ ...prev, companies: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="questionSets">Question Sets (comma separated, optional)</Label>
                                        <Input
                                            id="questionSets"
                                            name="questionSets"
                                            value={basicInfo.questionSets}
                                            onChange={(e) => setBasicInfo(prev => ({ ...prev, questionSets: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="difficulty">Difficulty (1-3)</Label>
                                        <Input
                                            id="difficulty"
                                            name="difficulty"
                                            type="number"
                                            min={1}
                                            max={3}
                                            value={basicInfo.difficulty}
                                            onChange={(e) => setBasicInfo(prev => ({ ...prev, difficulty: Number(e.target.value) }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="functionName">Function Name</Label>
                                        <Input
                                            id="functionName"
                                            name="functionName"
                                            value={basicInfo.functionName}
                                            onChange={(e) => setBasicInfo(prev => ({ ...prev, functionName: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="question">Question Content</Label>
                                        <div className="relative max-h-[400px] overflow-hidden">
                                            <Textarea
                                                id="question"
                                                name="question"
                                                rows={10}
                                                value={basicInfo.question}
                                                onChange={(e) => setBasicInfo(prev => ({ ...prev, question: e.target.value }))}
                                                required
                                                className="resize-none h-full max-h-[400px] overflow-y-auto"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="parameters" className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-medium">Input Parameters</h3>
                                            <Button type="button" variant="outline" onClick={handleAddParameter}>
                                                Add Parameter
                                            </Button>
                                        </div>

                                        {parameters.map((param, index) => (
                                            <Card key={index} className="p-4 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1">
                                                        <Label>Parameter Name</Label>
                                                        <Input
                                                            value={param.name}
                                                            onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                                                            placeholder="e.g., str1"
                                                        />
                                                    </div>
                                                    {index > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveParameter(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>C++ Type</Label>
                                                        <Select
                                                            value={param.types.cpp}
                                                            onValueChange={(value) => handleParameterTypeChange(index, "cpp", value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="string">string</SelectItem>
                                                                <SelectItem value="int">int</SelectItem>
                                                                <SelectItem value="bool">bool</SelectItem>
                                                                <SelectItem value="vector<int>">vector&lt;int&gt;</SelectItem>
                                                                <SelectItem value="vector<string>">vector&lt;string&gt;</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Java Type</Label>
                                                        <Select
                                                            value={param.types.java}
                                                            onValueChange={(value) => handleParameterTypeChange(index, "java", value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="String">String</SelectItem>
                                                                <SelectItem value="int">int</SelectItem>
                                                                <SelectItem value="boolean">boolean</SelectItem>
                                                                <SelectItem value="int[]">int[]</SelectItem>
                                                                <SelectItem value="String[]">String[]</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>JavaScript Type</Label>
                                                        <Select
                                                            value={param.types.javascript}
                                                            onValueChange={(value) => handleParameterTypeChange(index, "javascript", value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="string">string</SelectItem>
                                                                <SelectItem value="number">number</SelectItem>
                                                                <SelectItem value="boolean">boolean</SelectItem>
                                                                <SelectItem value="number[]">number[]</SelectItem>
                                                                <SelectItem value="string[]">string[]</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Python Type</Label>
                                                        <Select
                                                            value={param.types.python}
                                                            onValueChange={(value) => handleParameterTypeChange(index, "python", value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="str">str</SelectItem>
                                                                <SelectItem value="int">int</SelectItem>
                                                                <SelectItem value="bool">bool</SelectItem>
                                                                <SelectItem value="List[int]">List[int]</SelectItem>
                                                                <SelectItem value="List[str]">List[str]</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}

                                        <div className="space-y-2">
                                            <Label>Output Type</Label>
                                            <div className="flex gap-2">
                                                <Select
                                                    name="outputType"
                                                    value={commonOutputTypes.some(t => t.value === selectedOutputType) ? selectedOutputType : "custom"}
                                                    onValueChange={(value) => {
                                                        if (value === "custom") {
                                                            // Don't update selectedOutputType for custom option
                                                            return;
                                                        }
                                                        setSelectedOutputType(value);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-[200px]">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {commonOutputTypes.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <div className="flex-1">
                                                    <Input
                                                        id="customOutputType"
                                                        name="outputType"
                                                        placeholder="Custom type (e.g., List[Tuple[int, str]])"
                                                        value={selectedOutputType}
                                                        onChange={(e) => {
                                                            setSelectedOutputType(e.target.value);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Select a common type or enter a custom type
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Evaluation Mode</Label>
                                            <Select
                                                value={evalMode}
                                                onValueChange={(value: EvalMode) => setEvalMode(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="exactMatch">Exact Match</SelectItem>
                                                    <SelectItem value="listNodeIter">List Node Iterator</SelectItem>
                                                    <SelectItem value="sortedMatch">Sorted Match</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-sm text-muted-foreground">
                                                Select how to evaluate the test cases
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="testcases" className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                                    {testcases.map((testcase, index) => (
                                        <Card key={index} className="p-4 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-medium">Test Case {index + 1}</h3>
                                                {index > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newTestcases = testcases.filter((_, i) => i !== index);
                                                            setTestcases(newTestcases);
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Input fields based on parameters */}
                                            <div className="space-y-4">
                                                {parameters.map((param) => (
                                                    <div key={param.name} className="space-y-2">
                                                        <Label>{param.name}</Label>
                                                        {param.types.javascript.includes('[]') ||
                                                            param.types.python.includes('List') ||
                                                            param.types.cpp.includes('vector') ? (
                                                            <Textarea
                                                                value={Array.isArray(testcase.input[param.name])
                                                                    ? JSON.stringify(testcase.input[param.name])
                                                                    : testcase.input[param.name] || "[]"}
                                                                onChange={(e) => handleTestcaseChange(index, param.name, e.target.value)}
                                                                placeholder={`Enter array (e.g., [1,2,3])`}
                                                                rows={3}
                                                            />
                                                        ) : (
                                                            <Input
                                                                value={testcase.input[param.name] || ""}
                                                                onChange={(e) => handleTestcaseChange(index, param.name, e.target.value)}
                                                                placeholder={`Enter ${getGenericType(param.types)}`}
                                                                type="text"
                                                            />
                                                        )}
                                                    </div>
                                                ))}

                                                <div className="space-y-2">
                                                    <Label>Expected Output</Label>
                                                    {selectedOutputType.toLowerCase().includes('bool') ? (
                                                        <Select
                                                            value={String(testcase.output)}
                                                            onValueChange={(value) => {
                                                                const updatedTestcases = [...testcases];
                                                                updatedTestcases[index].output = value === 'true';
                                                                setTestcases(updatedTestcases);
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select value" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="true">true</SelectItem>
                                                                <SelectItem value="false">false</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : selectedOutputType.includes('List[') ||
                                                        selectedOutputType.includes('[]') ? (
                                                        <Textarea
                                                            value={Array.isArray(testcase.output)
                                                                ? JSON.stringify(testcase.output)
                                                                : testcase.output || "[]"}
                                                            onChange={(e) => {
                                                                const updatedTestcases = [...testcases];
                                                                updatedTestcases[index].output = parseValueByType(e.target.value, selectedOutputType);
                                                                setTestcases(updatedTestcases);
                                                            }}
                                                            placeholder={`Enter array (e.g., [1,2,3])`}
                                                            rows={3}
                                                        />
                                                    ) : (
                                                        <Input
                                                            value={testcase.output || ""}
                                                            onChange={(e) => {
                                                                const updatedTestcases = [...testcases];
                                                                updatedTestcases[index].output = parseValueByType(e.target.value, selectedOutputType);
                                                                setTestcases(updatedTestcases);
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                    <Button type="button" variant="outline" onClick={handleAddTestcase}>
                                        Add Test Case
                                    </Button>
                                </TabsContent>
                                <TabsContent value="validation" className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="validationLanguage">Language</Label>
                                            <Select
                                                value={validationLanguage}
                                                onValueChange={setValidationLanguage}
                                            >
                                                <SelectTrigger className="w-[150px]">
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="python">Python</SelectItem>
                                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                                    <SelectItem value="java">Java</SelectItem>
                                                    <SelectItem value="cpp">C++</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex gap-2">
                                            {/* Add solution generation UI */}
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={selectedSolutionLanguage}
                                                    onValueChange={setSelectedSolutionLanguage}
                                                >
                                                    <SelectTrigger className="w-[150px]">
                                                        <SelectValue placeholder="Generate in" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="python">Python</SelectItem>
                                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                                        <SelectItem value="java">Java</SelectItem>
                                                        <SelectItem value="cpp">C++</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleGenerateSolution}
                                                    disabled={isSolutionGenerating}
                                                >
                                                    {isSolutionGenerating ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : (
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                    )}
                                                    Generate Solution
                                                </Button>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleRunValidation}
                                                disabled={isValidating || !validationCode.trim()}
                                            >
                                                {isValidating ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <>
                                                        <Play className="h-3.5 w-3.5 mr-1" />
                                                        <span>Run Tests</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Rest of the validation tab content */}
                                    <div className="grid grid-rows-2 gap-4 h-[800px] max-w-full overflow-x-auto">
                                        {/* Top Section - Code Editor */}
                                        <Card className="p-4 flex flex-col min-w-[800px]">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-medium">Validation Code</h3>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={validationLanguage}
                                                        onValueChange={(lang) => {
                                                            setValidationLanguage(lang);
                                                            if (editingQuestion?.solutions) {
                                                                setValidationCode(editingQuestion.solutions[lang] || "");
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-[150px]">
                                                            <SelectValue placeholder="Select language" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {validationLanguages.map((lang) => (
                                                                <SelectItem key={lang} value={lang}>
                                                                    {lang}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="flex-1 relative min-h-0 overflow-x-auto">
                                                <Editor
                                                    className="absolute inset-0"
                                                    language={validationLanguage || "python"}
                                                    theme={theme === "dark" ? "vs-dark" : "vs-light"}
                                                    value={validationCode}
                                                    options={{
                                                        fontSize: 14,
                                                        lineNumbers: "on",
                                                        roundedSelection: false,
                                                        scrollBeyondLastLine: false,
                                                        minimap: {
                                                            enabled: false,
                                                        },
                                                        wordWrap: "off",
                                                    }}
                                                    onChange={(value) => setValidationCode(value || "")}
                                                />
                                            </div>
                                        </Card>

                                        {/* Bottom Section - Output Panel */}
                                        <Card className="p-4 flex flex-col min-w-[800px]">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-medium">Test Results</h3>
                                                <Button
                                                    variant="outline"
                                                    className="h-8"
                                                    onClick={handleRunValidation}
                                                    disabled={isValidating}
                                                >
                                                    {isValidating ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Play className="h-3.5 w-3.5 mr-1" />
                                                            <span>Run Tests</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="flex-1 min-h-0 max-h-[300px] w-full overflow-hidden">
                                                <div className="h-full w-full border rounded-md bg-muted/50 overflow-auto">
                                                    <pre className="p-4 text-sm whitespace-pre">
                                                        {validationOutput}
                                                    </pre>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
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
                                        onClick={() => {
                                            setIsCreateDialogOpen(false);
                                            setEditingQuestion(null);
                                        }}
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
            </div>

            <div className="border rounded-lg">
                <div className="p-4 border-b space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="pl-9"
                            />
                        </div>

                        <Select
                            value={filters.category}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.difficulty}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Difficulties</SelectItem>
                                <SelectItem value="1">Easy</SelectItem>
                                <SelectItem value="2">Medium</SelectItem>
                                <SelectItem value="3">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Showing {filteredQuestions.length} of {questions?.length || 0} questions
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Test Cases</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredQuestions.map((question) => (
                            <TableRow key={question._id}>
                                <TableCell className="font-medium">{question.title}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {question.category?.map((cat) => (
                                            <Badge
                                                key={cat}
                                                variant="secondary"
                                                className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            >
                                                {cat}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            question.difficulty === 1 && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                            question.difficulty === 2 && "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                                            question.difficulty === 3 && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                        )}
                                    >
                                        {question.difficulty === 1 && "Easy"}
                                        {question.difficulty === 2 && "Medium"}
                                        {question.difficulty === 3 && "Hard"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {question.tests?.length || 0} cases
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setPreviewQuestion(question);
                                                setIsPreviewDialogOpen(true);
                                            }}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditingQuestion(question);
                                                setIsCreateDialogOpen(true);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setQuestionToDelete(question._id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredQuestions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No questions found matching your filters
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Preview Dialog */}
            <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {previewQuestion?.title}
                            <div className="flex items-center gap-1 ml-2">
                                {previewQuestion?.category?.map((cat) => (
                                    <Badge
                                        key={cat}
                                        variant="secondary"
                                        className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    >
                                        {cat}
                                    </Badge>
                                ))}
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn(
                                    previewQuestion?.difficulty === 1 && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                    previewQuestion?.difficulty === 2 && "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                                    previewQuestion?.difficulty === 3 && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                )}
                            >
                                {previewQuestion?.difficulty === 1 && "Easy"}
                                {previewQuestion?.difficulty === 2 && "Medium"}
                                {previewQuestion?.difficulty === 3 && "Hard"}
                            </Badge>
                            <Badge variant="secondary">
                                {previewQuestion?.tests?.length || 0} test cases
                            </Badge>
                        </div>

                        {/* Function Signature */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">Function Signature</h3>
                                <Badge variant="outline" className="ml-2">
                                    {previewQuestion?.evalMode === "exactMatch" && "Exact Match"}
                                    {previewQuestion?.evalMode === "listNodeIter" && "List Node Iterator"}
                                    {previewQuestion?.evalMode === "sortedMatch" && "Sorted Match"}
                                </Badge>
                            </div>
                            <Card className="p-4">
                                <div className="font-mono text-sm">
                                    <span className="text-blue-500 dark:text-blue-400">function</span>{" "}
                                    <span className="text-yellow-600 dark:text-yellow-400">{previewQuestion?.functionName}</span>
                                    {" "}<span className="text-gray-500 dark:text-gray-400">&gt;</span>{" "}
                                    <span className="text-green-600 dark:text-green-400">
                                        {previewQuestion?.outputParameters}
                                    </span>
                                </div>
                            </Card>
                        </div>

                        {/* Input Parameters */}
                        <div>
                            <h3 className="font-medium mb-2">Input Parameters</h3>
                            <Card className="p-4">
                                <div className="space-y-2">
                                    {Object.entries(previewQuestion?.inputParameters || {}).map(([name, value]) => (
                                        <div key={name} className="font-mono text-sm">
                                            <span className="text-yellow-600 dark:text-yellow-400">{name}</span>:{" "}
                                            <span className="text-green-600 dark:text-green-400">
                                                {JSON.stringify(value, null, 2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Question Content */}
                        <div>
                            <h3 className="font-medium mb-2">Question Content</h3>
                            <div className="border rounded-lg">
                                <div className="relative bg-background p-4">
                                    <div className="prose dark:prose-invert max-w-none">
                                        <ReactMarkdown>
                                            {formatQuestionContent(previewQuestion?.question || "")}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Test Cases */}
                        <div>
                            <h3 className="font-medium mb-2">Test Cases</h3>
                            <div className="space-y-4">
                                {previewQuestion?.tests?.map((testcase, index) => (
                                    <Card key={index} className="p-4">
                                        <h4 className="font-medium mb-2">Test Case {index + 1}</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm font-medium">Input:</span>
                                                <pre className="mt-1 p-2 bg-muted rounded-md overflow-x-auto">
                                                    {formatJSON(testcase.input)}
                                                </pre>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium">Expected Output:</span>
                                                <pre className="mt-1 p-2 bg-muted rounded-md overflow-x-auto">
                                                    {formatJSON(testcase.output)}
                                                </pre>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!questionToDelete} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the question
                            and all its associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => questionToDelete && handleDelete(questionToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
