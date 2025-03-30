import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface StudyCardProps {
  icon: any;
  title: string;
  description: string;
  name: string;
  id: string;
}

const StudyCard = ({ icon, title, description, name, id }: StudyCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/coding/studyplan/${id}`);
  };

  return (
    <Card
      className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors group cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-4">
        <div className="relative w-12 h-12">
          <Image src={icon} alt={title} fill className="object-cover rounded-lg" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <ArrowRight className="h-4 w-4 text-foreground" />
      </Button>
    </Card>
  );
};

export default StudyCard;
