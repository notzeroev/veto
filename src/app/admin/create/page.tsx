"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { CreateVetoForm } from "@/components/veto/CreateVetoForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function CreateContent() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button
            variant="link"
            nativeButton={false}
            render={<Link href="/admin">← Back to dashboard</Link>}
            className="px-0 text-muted-foreground"
          />
          <h1 className="text-2xl font-bold mt-4">New Veto</h1>
        </div>

        <CreateVetoForm />
      </div>
    </div>
  );
}

export default function CreateVetoPage() {
  return (
    <AuthGuard>
      <CreateContent />
    </AuthGuard>
  );
}
