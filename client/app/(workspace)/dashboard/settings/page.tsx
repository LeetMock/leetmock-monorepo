import { Separator } from "@/components/ui/separator";
import { AccountForm } from "./account/AccountForm";

export default function SettingsProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Account</h3>
            </div>
            <Separator />
        </div>
    );
}
