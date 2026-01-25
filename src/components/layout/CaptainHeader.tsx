import { Header } from "./Header";
import { Badge } from "@/components/ui/badge";

interface CaptainHeaderProps {
  teamName: string;
}

export function CaptainHeader({ teamName }: CaptainHeaderProps) {
  return (
    <Header>
      <Badge variant="ghost" className="hover:bg-transparent dark:hover:bg-transparent">
        <span className="font-semibold text-foreground">Rep</span>
        <span className="text-muted-foreground">[{teamName}]</span>
      </Badge>
    </Header>
  );
}
