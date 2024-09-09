import { Separator } from "@/components/ui/separator";
import { AccountForm } from "./AccountForm";
import { Authenticated } from "convex/react";

export default function SettingsAccountPage() {
  return (
    <div className="space-y-6">
      <AccountForm />
    </div>
  );
}
