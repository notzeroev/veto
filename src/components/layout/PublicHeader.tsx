import Link from "next/link";
import { Header } from "./Header";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";

export function PublicHeader() {
  return (
    <Header>
      <Button
            variant="constructive"
            nativeButton={false}
            render={
              <Link href="/admin/create">
                <PlusIcon className="size-4" />
                New Veto
              </Link>
            }
          />
    </Header>
  );
}
