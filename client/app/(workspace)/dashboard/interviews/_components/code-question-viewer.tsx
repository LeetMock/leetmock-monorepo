import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";
import { Dice3 } from "lucide-react";
import { useState } from "react";
import { QuestionCard } from "./question-card";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";

interface Question {
  _id: Id<"questions">;
  title: string;
  difficulty: number;
  category: string[];
}

const DifficultyBubble: React.FC<{ difficulty: number }> = ({ difficulty }) => {
  const colors = {
    1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    2: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    3: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  const labels = {
    1: "Easy",
    2: "Medium",
    3: "Hard",
  };
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty]}`}
    >
      {labels[difficulty]}
    </span>
  );
};

export const CodeQuestionViewer: React.FC<{
  questions: Question[];
  onQuestionSelected: (id: Id<"questions">) => void;
}> = ({ questions, onQuestionSelected }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]);
  const [searchTags, setSearchTags] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<Id<"questions"> | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const filteredQuestions = questions.filter((question) => {
    const titleMatch = question.title.toLowerCase().includes(searchTerm.toLowerCase());
    const difficultyMatch =
      selectedDifficulties.length === 0 || selectedDifficulties.includes(question.difficulty);
    const tagsMatch =
      searchTags === "" ||
      question.category.some((tag) => tag.toLowerCase().includes(searchTags.toLowerCase()));

    return titleMatch && difficultyMatch && tagsMatch;
  });

  // Sort questions by difficulty: Easy (1), Medium (2), Hard (3)
  const sortedQuestions = [...filteredQuestions].sort((a, b) => a.difficulty - b.difficulty);

  const handleRandomSelect = () => {
    if (filteredQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      const randomQuestion = filteredQuestions[randomIndex];
      setSelectedQuestionId(randomQuestion._id);
      onQuestionSelected(randomQuestion._id);
    }
  };

  const handleDifficultyChange = (difficulty: number) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty) ? prev.filter((d) => d !== difficulty) : [...prev, difficulty]
    );
  };

  const handleQuestionSelect = (id: Id<"questions">) => {
    setSelectedQuestionId(id);
    onQuestionSelected(id);
  };

  return (
    <div className={cn("flex flex-col", isDesktop && "flex-1")}>
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select difficulty">
                {selectedDifficulties.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedDifficulties.map((difficulty) => (
                      <DifficultyBubble key={difficulty} difficulty={difficulty} />
                    ))}
                  </div>
                ) : (
                  "Select difficulty"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <div className="space-y-2">
                  {[1, 2, 3].map((difficulty) => (
                    <div key={difficulty} className="flex items-center space-x-2">
                      <Checkbox
                        id={`difficulty-${difficulty}`}
                        checked={selectedDifficulties.includes(difficulty)}
                        onCheckedChange={() => handleDifficultyChange(difficulty)}
                      />
                      <label htmlFor={`difficulty-${difficulty}`}>
                        <DifficultyBubble difficulty={difficulty} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Search tags..."
            value={searchTags}
            onChange={(e) => setSearchTags(e.target.value)}
            className="w-full"
          />
          <Button
            onClick={handleRandomSelect}
            className="w-full sm:w-auto"
            disabled={filteredQuestions.length === 0}
          >
            <Dice3 className="h-4 w-4 mr-2" />
            Random Pick
          </Button>
        </div>
      </div>

      <div className="md:flex-grow overflow-y-auto p-4">
        {sortedQuestions.length === 0 ? (
          <p className="text-center">No questions available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {sortedQuestions.map(({ _id, title, difficulty, category }) => (
              <QuestionCard
                key={_id}
                _id={_id}
                title={title}
                difficulty={difficulty}
                category={category}
                onQuestionSelected={handleQuestionSelect}
                isSelected={_id === selectedQuestionId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
