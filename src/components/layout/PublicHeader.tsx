import Link from "next/link";
import { Header } from "./Header";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <Header>
      <Button
        nativeButton={false}
        render={<Link href="/admin">Start a Veto</Link>}
        size="sm"
      />
    </Header>
  );
}
