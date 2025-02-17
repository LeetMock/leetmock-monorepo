import { Button } from "@/components/ui/button";

// Topic Pills Component
const TopicPill = ({ children, active = false }: { children: React.ReactNode, active?: boolean }) => (
    <Button
        variant={active ? "default" : "secondary"}
        className="rounded-full"
    >
        {children}
    </Button>
);

export default TopicPill;