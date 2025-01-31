import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { isDefined } from "@/lib/utils";
import { useAction, useMutation } from "convex/react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface EndViewProps {
  session: Doc<"sessions">;
}

export const EndView = ({ session }: EndViewProps) => {
  const [countdown, setCountdown] = useState(30);
  const endSession = useMutation(api.sessions.endSession);

  const handleEndSession = useCallback(async () => {
    if (!isDefined(session)) return;

    const promise = Promise.all([
      endSession({ sessionId: session._id }),
    ]);

    toast.promise(promise, {
      loading: "Ending session...",
      success: "Session ended successfully! 🎉",
      error: "Failed to end session",
    });
  }, [endSession, session]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // End session when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      handleEndSession();
    }
  }, [countdown, handleEndSession]);

  return (
    <div className="relative flex items-center justify-center h-full w-full overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 flex justify-center items-center">
        {/* Top Left Vertex */}
        <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-40 h-40 bg-blue-500 opacity-30 blur-3xl rounded-full animate-pulse"></div>
        </div>
        {/* Bottom Right Vertex */}
        <div className="absolute bottom-1/3 right-1/3 transform translate-x-1/2 translate-y-1/2">
          <div className="w-40 h-40 bg-green-500 opacity-30 blur-3xl rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="relative bg-white/95 shadow-[0_2px_16px_-2px_rgba(0,0,0,0.1)] rounded-xl p-7 text-center max-w-md mx-auto z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold text-gray-900">Congratulations!</h2>
          <div className="flex flex-col gap-1">
            <p className="text-base text-gray-600">Your interview has ended successfully.</p>
            <p className="text-base text-gray-600">
              The session will be automatically ended in{" "}
              <span className="font-medium text-blue-600">{countdown}</span> seconds.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
