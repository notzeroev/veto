"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { CaretDown, Plus, RowsIcon, SignOut } from "@phosphor-icons/react";

export function UserMenu() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.current);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 text-sm transition-colors outline-none">
        {user.username}
        <CaretDown className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <Link href="/admin/create">
          <DropdownMenuItem className="cursor-pointer">
            <Plus className="size-4" />
            New Veto
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href="/admin">
          <DropdownMenuItem className="cursor-pointer">
            <RowsIcon className="size-4" />
            Dashboard
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut()}
          className="cursor-pointer"
        >
          <SignOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
