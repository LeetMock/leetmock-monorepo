import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GithubCardShiny from "./animata/card/github-card-shiny";

export const HeroCards = () => {
  return (
    <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
      {/* Jakub Gao's Testimonial */}
      <div
        className="absolute w-[340px] -top-[30px] rounded-3xl bg-gradient-to-r p-0.5 hover:shadow-glow"
        style={{
          transition: "box-shadow 0.5s ease",
          backgroundImage: "linear-gradient(to right, #4158D0, #C850C0, #FFCC70)",
        }}
      >
        <div
          className="blur-20 inset-0 h-full w-full rounded-3xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FFCC70] hover:brightness-150"
          style={{ transition: "filter 0.5s ease" }}
        />
        <Card className="h-full w-full rounded-[calc(1.5rem-2px)] bg-card">
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
      </div>

      {/* Jessica's Card */}
      <div
        className="absolute right-[20px] top-4 w-80 rounded-3xl bg-gradient-to-r p-0.5 hover:shadow-glow"
        style={{
          transition: "box-shadow 0.5s ease",
          backgroundImage: "linear-gradient(to right, #4158D0, #C850C0, #FFCC70)",
        }}
      >
        <div
          className="blur-20 inset-0 h-full w-full rounded-3xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FFCC70] hover:brightness-150"
          style={{ transition: "filter 0.5s ease" }}
        />
        <Card className="h-full w-full rounded-[calc(1.5rem-2px)] bg-card">
          <CardHeader className="mt-8 flex justify-center items-center pb-2">
            <Image
              src="https://i.pravatar.cc/150?img=31"
              alt="user avatar"
              className="absolute grayscale-[0%] -top-12 rounded-full w-24 h-24 aspect-square object-cover"
            />
            <CardTitle className="text-center">Jessica</CardTitle>
            <CardDescription className="font-normal text-primary">
              Full Stack Developer
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center pb-2">
            <p>
              I love practicing coding interviews with LeetMock. Its personalized feedback helps me
              sharpen my skills in ways no other platform has before.
            </p>
          </CardContent>

          <CardFooter>
            <div>{/* You can add additional content here if needed */}</div>
          </CardFooter>
        </Card>
      </div>

      {/* Pricing Card */}
      <div
        className="absolute top-[180px] left-[50px] w-72 rounded-3xl bg-gradient-to-r p-0.5 hover:shadow-glow"
        style={{
          transition: "box-shadow 0.5s ease",
          backgroundImage: "linear-gradient(to right, #4158D0, #C850C0, #FFCC70)",
        }}
      >
        <div
          className="blur-20 inset-0 h-full w-full rounded-3xl bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FFCC70] hover:brightness-150"
          style={{ transition: "filter 0.5s ease" }}
        />
        <Card className="h-full w-full rounded-[calc(1.5rem-2px)] bg-card">
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
              {[
                "600 interview minutes",
                "Various question options",
                "Personalized feedback / recap",
                "Email Support",
              ].map((benefit: string) => (
                <span key={benefit} className="flex">
                  <Check className="text-green-500" /> <h3 className="ml-2">{benefit}</h3>
                </span>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>

      <GithubCardShiny className="absolute right-[20px] -bottom-12 w-72 h-[240px] drop-shadow-xl shadow-black/10 dark:shadow-white/10" />
    </div>
  );
};
