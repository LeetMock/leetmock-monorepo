import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MoveRight, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import InterviewSelectionPage from "@/app/(workspace)/problems/page"
import { useState } from "react"

export function InterviewSelectionDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[900px] sm:w-[90vw]">
        <DialogHeader>
          <DialogTitle>Select an Interview</DialogTitle>
          <DialogDescription>
            Choose from our available coding interviews.
          </DialogDescription>
        </DialogHeader>
        <InterviewSelectionPage />
      </DialogContent>
    </Dialog>
  )
}

export function StartInterviewDialog() {
  const [startDialogOpen, setStartDialogOpen] = useState(false)
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false)

  return (
    <>
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="expandIcon"
            size="lg"
            Icon={() => <MoveRight className="w-4 h-4 mt-px" />}
            iconPlacement="right"
          >
            Start Interview
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] sm:w-[90vw]">
          <DialogHeader>
            <DialogTitle>Choose Interview Type</DialogTitle>
            <DialogDescription>
              Select the type of interview you'd like to start.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
            <Card className="flex flex-col relative overflow-hidden">
              <CardHeader>
                <CardTitle>System Design</CardTitle>
                <CardDescription>Design scalable systems</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>Practice designing large-scale distributed systems with interactive diagrams and AI assistance.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled>Coming Soon</Button>
              </CardFooter>
              <Badge variant="secondary" className="absolute top-2 right-2 bg-yellow-200 text-yellow-800">
                Coming Soon
              </Badge>
              <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                <Clock className="w-12 h-12 text-gray-400" />
              </div>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Coding Interview</CardTitle>
                <CardDescription>Practice algorithmic problem-solving</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>Try our unique AI (not just a chatbot 🤖!) mock interview! It adapts in real-time, giving you dynamic feedback, real interview pressure, and personalized guidance—all while making it fun!</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => {
                    setStartDialogOpen(false)
                    setSelectionDialogOpen(true)
                  }}
                >
                  Start Coding Interview
                </Button>
              </CardFooter>
            </Card>
            <Card className="flex flex-col relative overflow-hidden">
              <CardHeader>
                <CardTitle>Behavioral</CardTitle>
                <CardDescription>Improve your soft skills</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>Enhance your communication and problem-solving skills with AI-powered behavioral interviews.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled>Coming Soon</Button>
              </CardFooter>
              <Badge variant="secondary" className="absolute top-2 right-2 bg-yellow-200 text-yellow-800">
                Coming Soon
              </Badge>
              <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                <Clock className="w-12 h-12 text-gray-400" />
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <InterviewSelectionDialog open={selectionDialogOpen} setOpen={setSelectionDialogOpen} />
    </>
  )
}
