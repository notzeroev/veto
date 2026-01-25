import { Header } from "./Header";
import { Badge } from "@/components/ui/badge";

interface CaptainHeaderProps {
  teamTag: string;
}

export function CaptainHeader({ teamTag }: CaptainHeaderProps) {
  return (
    <Header>
      <Badge variant="ghost" className="hover:bg-transparent dark:hover:bg-transparent">
        <span className="font-semibold text-foreground">Rep</span>
        <span className="text-muted-foreground">[{teamTag}]</span>
      </Badge>
    </Header>
  );
}
