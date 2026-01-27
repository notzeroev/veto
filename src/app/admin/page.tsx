"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@phosphor-icons/react";

export default function AdminDashboard() {
  const vetos = useQuery(api.vetos.listMyVetos);

  return (
    <Container className="py-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Vetos</h1>
          <Button
            variant="constructive"
            nativeButton={false}
            render={
              <Link href="/admin/create">
                <PlusIcon className="size-4" />
                New Veto
              </Link>
            }
          />
        </div>

        {/* Loading state */}
        {vetos === undefined && (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        )}

        {/* Empty state */}
        {vetos?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No vetos yet</div>
          </div>
        )}

        {/* Veto list */}
        {vetos && vetos.length > 0 && (
          <div className="space-y-3">
            {vetos.map((veto) => (
              <Link
                key={veto._id}
                href={`/admin/veto/${veto._id}`}
                className="block"
              >
                <Card className="p-4 hover:ring-muted-foreground/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        {veto.teamA.tag} vs {veto.teamB.tag}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {veto.name} - {veto.format.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {veto.status.replace("_", " ")}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
