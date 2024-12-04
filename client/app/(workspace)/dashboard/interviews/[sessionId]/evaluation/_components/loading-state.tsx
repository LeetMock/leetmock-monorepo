import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export const EvaluationLoading = () => {
    return (
        <div className="container mx-auto py-32 px-4">
            <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center space-y-4 text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 className="h-12 w-12 text-blue-500" />
                    </motion.div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                        Analyzing Your Interview...
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                        We're carefully evaluating your performance across multiple dimensions.
                        This thoughtful analysis helps ensure you receive comprehensive and accurate feedback.
                    </p>
                </motion.div>
            </Card>
        </div>
    );
}; 