import { cn, getInitials } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ProfileItem: React.FC<ProfileItemProps> = ({ className, ...props }) => {
  const { user } = useUser();
  const initials = getInitials(user?.firstName, user?.lastName);

  return (
    <div
      className={cn(
        "flex items-center justify-between bg-muted rounded-sm p-2",
        "transition-all duration-200 cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <Avatar>
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <p className="text-sm font-medium">{user?.fullName}</p>
          <p className="text-sm text-muted-foreground">{user?.emailAddresses[0].emailAddress}</p>
        </div>
      </div>
      <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
    </div>
  );
};
