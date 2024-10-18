import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { QuestionCard } from "./question-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dice3, LayoutGrid, List } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    3: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };
  const labels = {
    1: "Easy",
    2: "Medium",
    3: "Hard"
  };
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
};

export const CodeQuestionViewer: React.FC<{
  questions: Question[];
  onQuestionSelected: (id: Id<"questions">) => void;
  onRandomPick: () => void;
}> = ({ questions, onQuestionSelected, onRandomPick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]);
  const [searchTags, setSearchTags] = useState("");
  const [isCardView, setIsCardView] = useState(true);
  const [selectedQuestionId, setSelectedQuestionId] = useState<Id<"questions"> | null>(null);

  const filteredQuestions = questions.filter((question) => {
    const titleMatch = question.title.toLowerCase().includes(searchTerm.toLowerCase());
    const difficultyMatch = selectedDifficulties.length === 0 || selectedDifficulties.includes(question.difficulty);
    const tagsMatch = searchTags === '' || question.category.some(tag =>
      tag.toLowerCase().includes(searchTags.toLowerCase())
    );

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
    setSelectedDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const toggleView = () => setIsCardView(!isCardView);

  const handleQuestionSelect = (id: Id<"questions">) => {
    setSelectedQuestionId(id);
    onQuestionSelected(id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 shrink-0 border-b flex items-center justify-between px-4">
        <span className="font-semibold">Question Selector</span>
        <Button variant="ghost" size="icon" onClick={toggleView}>
          {isCardView ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4">
        <div className="col-span-1">
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="col-span-1">
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select difficulty">
                {selectedDifficulties.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedDifficulties.map(difficulty => (
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
                  {[1, 2, 3].map(difficulty => (
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
        <Input
          type="text"
          placeholder="Search tags..."
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
          className="w-full"
        />
        <div className="col-span-1">
          <Button
            onClick={onRandomPick}
            className="w-full"
            disabled={filteredQuestions.length === 0}
          >
            <Dice3 className="w-4 h-4 mr-2" />
            Random Pick
          </Button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {sortedQuestions.length === 0 ? (
          <p className="text-center">No questions available.</p>
        ) : isCardView ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedQuestions.map(({ _id, title, difficulty, category }, index) => (
                  <tr
                    key={_id}
                    onClick={() => handleQuestionSelect(_id)}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                      index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800',
                      _id === selectedQuestionId ? 'bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800' : ''
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <DifficultyBubble difficulty={difficulty} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-1">
                        {category.map((cat, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
