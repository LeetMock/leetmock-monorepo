import { Card } from "@/components/ui/card";
import Image, { StaticImageData } from "next/image";

const StudyCard = ({ icon, title, description }: { icon: StaticImageData, title: string, description: string }) => (
    <Card className="flex items-center space-x-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer">
        <div className="relative w-12 h-12">
            <Image
                src={icon}
                alt={title}
                fill
                className="object-cover rounded-lg"
            />
        </div>
        <div className="flex flex-col">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </Card>
);

export default StudyCard;