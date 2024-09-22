"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MembershipCardProps {
    name: string;
    description: string;
    price: string;
    advantages: string[];
    // href: string;
  }

const memberItems: MembershipCardProps[] = [
    { name: "Basic Plan", description: "Our most popular plan.", price: "$1", advantages:["Advantage 1", "Advantage 2", "Advantage 3"] },
    { name: "Advanced Plan", description: "Our most popular plan.", price: "$2", advantages:["Advantage 1", "Advantage 2", "Advantage 3"] },
    { name: "VIP Plan", description: "Our most popular plan.", price: "$3", advantages:["Advantage 1", "Advantage 2", "Advantage 3"] }
  ];

const MembershipCard = ({name, description, price, advantages}: MembershipCardProps) => {
    return (
        <nav className={cn("flex flex-row gap-4 mr-8 items-start space-x-4")}>
        {memberItems.map((item, index) => (
            <div key={index} className="w-full">
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
                
                <Link href="/dashboard/pricing/payment">
                    <Button className="mb-4 w-full">                
                        SELECT 
                    </Button>
                </Link>

                <div className="mb-4">
                    What you will get
                </div>
                {item.advantages.map((advantage) => (
                    <div key={index}>
                        {advantage}
                    </div>
                ))}
                </CardContent>
                </Card>
            </div>
        ))}
        </nav>
    );
};

const PricingPage: React.FC = () => {
    return (
      <div className="flex flex-col p-8 space-y-8">
        <div>
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
