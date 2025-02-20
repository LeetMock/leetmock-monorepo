import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubscriptionTier } from "@/convex/schema";

interface UserFiltersProps {
  filters: {
    search: string;
    role: string;
    subscription: string;
    status: string;
  };
  setFilters: (filters: any) => void;
}

export function UserFilters({ filters, setFilters }: UserFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Input
        placeholder="Search by email or user ID..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="max-w-xs"
      />
      
      <Select
        value={filters.role}
        onValueChange={(value) => setFilters({ ...filters, role: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="waitlist">Waitlist</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.subscription}
        onValueChange={(value) => setFilters({ ...filters, subscription: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Plans</SelectItem>
          {Object.values(SubscriptionTier).map((tier) => (
            <SelectItem key={tier} value={tier}>
              {tier}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => setFilters({ ...filters, status: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 