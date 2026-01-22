"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function UserMenu() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.current);

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-zinc-400">{user.email}</span>
      <button
        onClick={() => signOut()}
        className="text-sm text-zinc-400 hover:text-white transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
