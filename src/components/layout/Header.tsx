"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useConvexAuth } from "convex/react";
import { Container } from "./Container";

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  const { isAuthenticated } = useConvexAuth();

  return (
    <header className="border-b border-border py-4">
      <Container className="flex items-center justify-between">
        <Link
          href={isAuthenticated ? "/admin" : "/"}
          className="text-xl font-bold hover:text-muted-foreground transition-colors"
        >
          vet0<sup className="text-xs ml-1">beta</sup>
        </Link>
        {children}
      </Container>
    </header>
  );
}
