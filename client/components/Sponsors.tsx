import { Radar } from "lucide-react";
import Image from "next/image";

interface SponsorProps {
  icon: any;
  name: string;
}

const sponsors: SponsorProps[] = [
  {
    icon: <Image src="/roblox.png" alt="roblox-icon" width={60} height={60} />,
    name: "Roblox",
  },
  {
    icon: <Image src="/nvidia.png" alt="nvidia-icon" width={50} height={50} />,
    name: "NVIDIA",
  },
  {
    icon: <Image src="/usc.png" alt="usc-icon" width={90} height={90} />,
    name: "University of Southern California",
  },
  {
    icon: <Image src="/uiuc.png" alt="uiuc-icon" width={50} height={50} />,
    name: "University of Illinois Urbana Champaign",
  },
  {
    icon: <Image src="/UOB.png" alt="uiuc-icon" width={50} height={50} />,
    name: "University of Bristol",
  },
];

export const Sponsors = () => {
  return (
    <section id="sponsors" className="container pt-24 sm:py-32">
      <h2 className="text-center text-md lg:text-xl font-bold mb-8 text-primary">
        Built By Engineers From
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
        {sponsors.map(({ icon, name }: SponsorProps) => (
          <div
            key={name}
            className="flex items-center gap-1 text-muted-foreground/60"
          >
            <span>{icon}</span>
            <h3 className="text-xl  font-bold">{name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};
