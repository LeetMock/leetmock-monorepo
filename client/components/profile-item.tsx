import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { ChevronsUpDown } from "lucide-react";

interface ProfileItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ProfileItem: React.FC<ProfileItemProps> = ({ className, ...props }) => {
  const { user } = useUser();
  const initials = getInitials(user?.firstName, user?.lastName);

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full hover:bg-muted rounded-sm p-2",
        "transition-all duration-200 cursor-pointer relative",
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-2 relative max-w-[calc(100%-24px)]">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="overflow-hidden flex-grow">
          <div className="text-start overflow-hidden truncate">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <div>
              <p className="text-xs truncate overflow-ellipsis text-muted-foreground">
                {user?.emailAddresses[0].emailAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
      <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
    </div>
  );
};
