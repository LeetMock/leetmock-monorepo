"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

//comment
import Image from "next/image";
import Link from "next/link";
// import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DataTable } from "./_components/data-table";
import { columns, SessionDoc } from "./_components/columns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import { useMemo } from "react";
import { HiArrowNarrowRight } from "react-icons/hi";

interface MembershipCardProps {
    name: string;
    description: string;
    price: string;
  }

const memberItems: MembershipCardProps[] = [
    { name: "Basic Plan", description: "Our most popular plan.", price: "$1" },
    { name: "Advanced Plan", description: "Our most popular plan.", price: "$2" }
  ];

const MembershipCard = ({name, description, price}: MembershipCardProps) => {
    return (
        <nav className={cn("flex flex-row gap-4 mr-8 items-start space-x-4")}>
        {memberItems.map((item, index) => (
            <div key={index}>
                <Card className="shadow-xl">
                <CardHeader className="pb-3 mb-8">
                <CardTitle>{item.name}</CardTitle>
                <CardDescription> 
                    {item.description}
                </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-1 pb-3">
                <div className="flex flex-end space-x-3 p-3">
                <p className="text-sm font-medium leading-none " 
                    style={{
                        fontSize: '36px',
                        fontWeight: 'bold' 
                    }}>
                    {item.price}
                </p>
                <p className="text-sm text-muted-foreground " 
                    style={{
                        display: 'flex',
                        alignItems: 'flex-end'
                    }}>
                    /per month
                </p>
                </div>
                <Button className="mb-4">SELECT</Button>
                <div className="mb-4">
                    What you will get
                </div>
                <div>
                    Advantage 1
                </div>
                <div>
                    Advantage 2
                </div>
                <div>
                    Advantage 3
                </div>
                </CardContent>
                </Card>
            </div>
        ))}
        </nav>
        // <Card className="col-span-full relative overflow-hidden" x-chunk="dashboard-05-chunk-0">
        // <Image
        //     src="/coding.jpg"
        //     alt="Coding background"
        //     fill
        //     sizes="100vw"
        //     style={{ objectFit: "cover" }}
        //     className="opacity-15"
        //     priority
        // />
        // <div className="relative z-10">
        //     <CardHeader className="pb-3">
        //     <CardTitle className="text-xl font-semibold">
        //         a
        //     </CardTitle>
        //     <CardDescription className="max-w-lg text-balance leading-relaxed">
                
        //         a
        //     </CardDescription>
        //     </CardHeader>
        //     <CardFooter className="flex justify-end gap-4">
        //     <Link
        //         href='/dashboard/interviews/'
        //         passHref
        //     >
        //         <Button
        //         variant="expandIcon"
        //         size="lg"
        //         Icon={() => <HiArrowNarrowRight className="w-4 h-4 mt-px" />}
        //         iconPlacement="right"
        //         >play
        //         </Button>
        //     </Link>
        //     </CardFooter>
        // </div>
        // </Card>
    );
};

const PricingPage: React.FC = () => {
    const { user } = useUser();
    const sessions = useQuery(api.sessions.getByUserId, { userId: user!.id });
    const activeSession = useQuery(api.sessions.getActiveSession, { userId: user!.id });
    const question = useQuery(api.questions.getById, { questionId: activeSession?.questionId });
  
    const sessionList = useMemo(() => {
      if (!sessions) return [];
      return sessions as SessionDoc[];
    }, [sessions]);
  
    return (
      <div className="flex flex-col p-8 space-y-8">
        <div className="">
          <MembershipCard name= "Basic Plan" description= "Our most popular plan." price= "$1" />
        </div>
      </div>
    );
  };
// export default MembershipCard;
export default PricingPage;
// export default function Page() {
//     return (
//         <div className="flex items-center justify-center h-screen">
//             <div className="flex flex-col gap-4 mr-8">
//                 <Card className="shadow-xl">
//                 <CardHeader className="pb-3 mb-8">
//                 <CardTitle>Basic Plan</CardTitle>
//                 <CardDescription> 
//                     Our most popular plan.
//                 </CardDescription>
//                 </CardHeader>
//                 <CardContent className="grid gap-1 pb-3">
//                 <div className="flex flex-end space-x-3 p-3">
//                 <p className="text-sm font-medium leading-none " 
//                     style={{
//                         fontSize: '36px',
//                         fontWeight: 'bold' 
//                     }}>
//                     $1
//                 </p>
//                 <p className="text-sm text-muted-foreground " 
//                     style={{
//                         display: 'flex',
//                         alignItems: 'flex-end'
//                     }}>
//                     /per month
//                 </p>
//                 </div>
//                 <Button className="mb-4">SELECT</Button>
//                 <div className="mb-4">
//                     What you will get
//                 </div>
//                 <div>
//                     Advantage 1
//                 </div>
//                 <div>
//                     Advantage 2
//                 </div>
//                 <div>
//                     Advantage 3
//                 </div>
//                 </CardContent>
//                 </Card>
//             </div>

//             <div className="flex flex-col gap-4 mr-8">
//                 <Card className="shadow-xl">
//                 <CardHeader className="pb-3 mb-8">
//                 <CardTitle>Advanced Plan</CardTitle>
//                 <CardDescription> 
//                     Our most popular plan.
//                 </CardDescription>
//                 </CardHeader>
//                 <CardContent className="grid gap-1 pb-3">
//                 <div className="flex flex-end space-x-3 p-3">
//                 <p className="text-sm font-medium leading-none " 
//                     style={{
//                         fontSize: '36px',
//                         fontWeight: 'bold' 
//                     }}>
//                     $2
//                 </p>
//                 <p className="text-sm text-muted-foreground " 
//                     style={{
//                         display: 'flex',
//                         alignItems: 'flex-end'
//                     }}>
//                     /per month
//                 </p>
//                 </div>
//                 <Button className="mb-4">SELECT</Button>
//                 <div className="mb-4">
//                     What you will get
//                 </div>
//                 <div>
//                     Advantage 1
//                 </div>
//                 <div>
//                     Advantage 2
//                 </div>
//                 <div>
//                     Advantage 3
//                 </div>
//                 </CardContent>
//                 </Card>
//             </div>
//         </div>
    
    
    
//     );
//   }
