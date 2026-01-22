"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { CreateVetoForm } from "@/components/veto/CreateVetoForm";
import Link from "next/link";

function CreateContent() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-4">Create New Veto</h1>
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
