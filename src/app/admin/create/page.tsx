"use client";

import { CreateVetoForm } from "@/components/veto/CreateVetoForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateVetoPage() {
  return (
    <div className="p-6">
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
