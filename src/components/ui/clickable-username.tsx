import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ClickableUsernameProps {
  username: string;
  displayName?: string | null;
  showAt?: boolean;
  className?: string;
}

export function ClickableUsername({ 
  username, 
  displayName, 
  showAt = true,
  className 
}: ClickableUsernameProps) {
  if (!username) return <span className="text-muted-foreground">Unknown User</span>;

  const displayText = showAt ? `@${username}` : (displayName || username);

  return (
    <Link
      to={`/user/${username}`}
      className={cn(
        "hover:text-primary transition-colors hover:underline cursor-pointer",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {displayText}
    </Link>
  );
}
