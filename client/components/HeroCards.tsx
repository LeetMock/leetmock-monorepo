import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Check, Linkedin } from "lucide-react";
import { LightBulbIcon } from "@/components/Icons";
import Link from "next/link";

export const HeroCards = () => {
  return (
    <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
      {/* Testimonial */}
      <Card className="absolute w-[340px] -top-[15px] drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar>
            <AvatarImage alt="" src="https://github.com/shadcn.png" />
            <AvatarFallback>SH</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle className="text-lg">Jakub Gao</CardTitle>
            <CardDescription>@jakub_gao</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          LeetMock is the only AI mock interview platform that works for me.
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="absolute right-[20px] top-4 w-80 flex flex-col justify-center items-center drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="mt-8 flex justify-center items-center pb-2">
          <img
            src="https://i.pravatar.cc/150?img=31"
            alt="user avatar"
            className="absolute grayscale-[0%] -top-12 rounded-full w-24 h-24 aspect-square object-cover"
          />
          <CardTitle className="text-center">Jessica</CardTitle>
          <CardDescription className="font-normal text-primary">Full Stack Developer</CardDescription>
        </CardHeader>

        <CardContent className="text-center pb-2">
          <p>
            I love practicing coding interviews with LeetMock. Its personalized feedback helps me sharpen my skills in ways no other platform has before.
          </p>
        </CardContent>

        <CardFooter>
          <div>


          </div>
        </CardFooter>
      </Card>

      {/* Pricing */}
      <Card className="absolute top-[150px] left-[50px] w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader>
          <CardTitle className="flex item-center justify-between">
            Basic
            <Badge variant="secondary" className="text-sm text-primary">
              All essential features
            </Badge>
          </CardTitle>
          <div>
            <span className="text-3xl font-bold">$29.99</span>
            <span className="text-muted-foreground"> /month</span>
          </div>

          <CardDescription>Experience your first AI interview, on us.</CardDescription>
        </CardHeader>

        <CardContent>
          <Link href="/pricing" className={buttonVariants({ className: "w-full" })}>
            Start Today
          </Link>
        </CardContent>

        <hr className="w-4/5 m-auto mb-4" />

        <CardFooter className="flex">
          <div className="space-y-4">
            {["600 interview minutes", "Various question options", "Personalized feedback / recap", "Email Support"].map(
              (benefit: string) => (
                <span key={benefit} className="flex">
                  <Check className="text-green-500" /> <h3 className="ml-2">{benefit}</h3>
                </span>
              )
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Service */}
      <Card className="absolute w-[350px] -right-[10px] bottom-[35px]  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
          <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
            <LightBulbIcon />
          </div>
          <div>
            <CardTitle>Try It Out</CardTitle>
            <CardDescription className="text-md mt-2">
              Give it a try! The very first mock interview platform that actually works with Gen-AI!
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
