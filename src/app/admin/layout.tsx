"use client";

import { useConvexAuth } from "convex/react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { SignInForm } from "@/components/auth/SignInForm";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SignInForm />
      </div>
    );
  }

  return (
    <>
      <AdminHeader />
      <main>{children}</main>
    </>
  );
}
