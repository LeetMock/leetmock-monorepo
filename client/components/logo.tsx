import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <div aria-hidden="true" className="flex items-center">
        <Image
          src="/logo.png"
          alt="LeetMock.AI Logo"
          width={24}
          height={24}
          className="h-[1.35rem] w-auto"
        />
      </div>
      <span className="font-bold text-lg">LeetMock</span>
    </Link>
  );
};
