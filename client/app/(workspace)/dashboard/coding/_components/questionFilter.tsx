import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, Building2, GaugeCircle, CheckCircle2, Tags, Dice1, CircleDot, Timer, Crown, Clock, CheckCheck, AlertCircle, ChevronDown, X } from "lucide-react";
import TopicPill from "./topicPill";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface QuestionFilterProps {
    difficulty: string | null;
    setDifficulty: (value: string | null) => void;
    status: string | null;
    setStatus: (value: string | null) => void;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    tags: { name: string; count: number }[];
    companies: { name: string; count: number }[];
}

export default function QuestionFilter({
    difficulty,
    setDifficulty,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    tags,
    companies
}: QuestionFilterProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState("");
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [companySearch, setCompanySearch] = useState("");

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(tagSearch.toLowerCase())
    );

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(companySearch.toLowerCase())
    );

    return (
        <div className="flex flex-col space-y-3">
            <div className="flex space-x-3 items-center">
                <div className="flex space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 min-w-[130px] max-w-[200px] justify-start">
                                <Building2 className="h-4 w-4" />
                                Company {selectedCompanies.length > 0 && `(${selectedCompanies.length})`}
                                <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Filter companies"
                                        className="pl-8"
                                        value={companySearch}
                                        onChange={(e) => setCompanySearch(e.target.value)}
                                    />
                                </div>
                                <div className="h-[300px] overflow-y-auto">
                                    <div className="flex flex-wrap gap-2 p-2">
                                        {filteredCompanies.map((company) => (
                                            <button
                                                key={company.name}
                                                onClick={() => {
                                                    setSelectedCompanies(prev =>
                                                        prev.includes(company.name)
                                                            ? prev.filter(c => c !== company.name)
                                                            : [...prev, company.name]
                                                    );
                                                }}
                                                className={`px-2 py-1 rounded-full text-sm ${selectedCompanies.includes(company.name)
                                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                                    : 'bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {company.name} ({company.count})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <GaugeCircle className="h-4 w-4" />
                                {difficulty || "Difficulty"}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setDifficulty("Easy")}>
                                <span className="text-green-500">Easy</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDifficulty("Medium")}>
                                <span className="text-yellow-500">Medium</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDifficulty("Hard")}>
                                <span className="text-red-500">Hard</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                {status === "Complete" ? (
                                    <CheckCheck className="h-4 w-4 text-green-500" />
                                ) : status === "Incomplete" ? (
                                    <Clock className="h-4 w-4 text-blue-500" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                {status || "Status"}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setStatus("Complete")}>
                                <CheckCheck className="h-4 w-4 mr-2 text-green-500" />
                                Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus("Incomplete")}>
                                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                Incomplete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 min-w-[110px] max-w-[180px] justify-start">
                                <Tags className="h-4 w-4" />
                                Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                                <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Filter topics"
                                        className="pl-8"
                                        value={tagSearch}
                                        onChange={(e) => setTagSearch(e.target.value)}
                                    />
                                </div>
                                <div className="h-[300px] overflow-y-auto">
                                    <div className="flex flex-wrap gap-2 p-2">
                                        {filteredTags.map((tag) => (
                                            <button
                                                key={tag.name}
                                                onClick={() => {
                                                    setSelectedTags(prev =>
                                                        prev.includes(tag.name)
                                                            ? prev.filter(t => t !== tag.name)
                                                            : [...prev, tag.name]
                                                    );
                                                }}
                                                className={`px-2 py-1 rounded-full text-sm ${selectedTags.includes(tag.name)
                                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                                    : 'bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {tag.name} ({tag.count})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search questions"
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Button className="whitespace-nowrap gap-2">
                    <Dice1 className="h-4 w-4" />
                    Pick One
                </Button>
            </div>

            {(selectedTags.length > 0 || selectedCompanies.length > 0 || difficulty || status || searchQuery) && (
                <div className="flex flex-wrap gap-2">
                    {selectedCompanies.map((company) => (
                        <button
                            key={company}
                            onClick={() => {
                                setSelectedCompanies(prev =>
                                    prev.filter(c => c !== company)
                                );
                            }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                            {company}
                            <X className="h-4 w-4 ml-2" />
                        </button>
                    ))}

                    {selectedTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => {
                                setSelectedTags(prev =>
                                    prev.filter(t => t !== tag)
                                );
                            }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                            {tag}
                            <X className="h-4 w-4 ml-2" />
                        </button>
                    ))}

                    {difficulty && (
                        <button
                            onClick={() => setDifficulty(null)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                                ${difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                    difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'} hover:opacity-80`}
                        >
                            {difficulty}
                            <X className="h-4 w-4 ml-2" />
                        </button>
                    )}

                    {status && (
                        <button
                            onClick={() => setStatus(null)}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            {status}
                            <X className="h-4 w-4 ml-2" />
                        </button>
                    )}

                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Search: {searchQuery}
                            <X className="h-4 w-4 ml-2" />
                        </button>
                    )}

                    {(selectedTags.length > 0 || selectedCompanies.length > 0 || difficulty || status || searchQuery) && (
                        <button
                            onClick={() => {
                                setSelectedTags([]);
                                setSelectedCompanies([]);
                                setDifficulty(null);
                                setStatus(null);
                                setSearchQuery("");
                            }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm text-gray-600 hover:text-gray-900"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
