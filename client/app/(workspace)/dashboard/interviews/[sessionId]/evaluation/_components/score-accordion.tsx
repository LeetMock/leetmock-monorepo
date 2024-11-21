import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreAccordionProps {
  scoreboards: Record<
    string,
    Record<
      string,
      {
        description: string;
        maxScore: number;
        comment: string;
        examples: string[];
        score: number;
      }
    >
  >;
}

export const ScoreAccordion = ({ scoreboards }: ScoreAccordionProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Detailed Evaluation</h3>
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(scoreboards).map(([category, metrics], index) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="text-lg hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="capitalize">{category}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {Object.values(metrics).reduce((acc, curr) => acc + curr.score, 0)} /{" "}
                  {Object.values(metrics).reduce((acc, curr) => acc + curr.maxScore, 0)}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-4">
                {Object.entries(metrics).map(([metric, data]) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium capitalize">{metric}</h4>
                      <span className="text-sm text-muted-foreground">
                        {data.score}/{data.maxScore}
                      </span>
                    </div>
                    <Progress value={(data.score / data.maxScore) * 100} className="h-2" />
                    <p className="text-sm text-muted-foreground">{data.comment}</p>
                    <div className="space-y-1 mt-2">
                      {data.examples.map((example, i) => (
                        <div key={i} className="text-sm text-muted-foreground">
                          • {example}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}; 