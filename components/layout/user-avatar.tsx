"use client";

import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUser } from "@/lib/api/user";

export function UserAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 5 * 60 * 1000,
  });

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const sizeClass = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <Avatar className={`${sizeClass} cursor-pointer ring-2 ring-border hover:ring-primary transition-all`}>
      <AvatarImage src={user?.avatar_url} alt={user?.name ?? "User"} />
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
