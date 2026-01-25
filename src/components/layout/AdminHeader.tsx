"use client";

import { Header } from "./Header";
import { UserMenu } from "@/components/auth/UserMenu";

export function AdminHeader() {
  return (
    <Header>
      <UserMenu />
    </Header>
  );
}
