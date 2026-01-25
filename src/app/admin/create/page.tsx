"use client";

import { CreateVetoForm } from "@/components/veto/CreateVetoForm";
import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateVetoPage() {
  return (
    <Container className="py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mt-4">New Veto</h1>
        </div>

        <CreateVetoForm />
      </div>
    </Container>
  );
}
