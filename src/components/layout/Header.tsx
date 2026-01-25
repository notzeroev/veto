import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./Container";

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="border-b border-border py-4">
      <Container className="flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold hover:text-muted-foreground transition-colors"
        >
          vet0
        </Link>
        {children}
      </Container>
    </header>
  );
}
