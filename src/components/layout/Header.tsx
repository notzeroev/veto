"use client";

import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";

export function Header() {
  return (
    <header className="border-b border-border px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold hover:text-muted-foreground transition-colors"
        >
          vet0
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}
