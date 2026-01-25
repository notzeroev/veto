import Link from "next/link";
import type { ReactNode } from "react";

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="border-b border-border px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold hover:text-muted-foreground transition-colors"
        >
          vet0
        </Link>
        {children}
      </div>
    </header>
  );
}
