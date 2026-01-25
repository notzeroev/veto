import { Header } from "./Header";
import { Badge } from "@/components/ui/badge";

interface CaptainHeaderProps {
  teamName: string;
}

export function CaptainHeader({ teamName }: CaptainHeaderProps) {
  return (
    <Header>
      <Badge variant="ghost" className="hover:bg-transparent dark:hover:bg-transparent">
        <span className="text-muted-foreground">Repping</span>
        <span className="ml-2 font-semibold text-foreground">{teamName}</span>
      </Badge>
    </Header>
  );
}
