"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const vetos = useQuery(api.vetos.listMyVetos);

  return (
    <Container className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Vetos</h1>
        <Button
          nativeButton={false}
          render={<Link href="/admin/create">New Veto</Link>}
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
                    <div className="font-medium">{veto.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {veto.teamA.name} vs {veto.teamB.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground uppercase">
                      {veto.format}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        veto.status === "completed" &&
                          "bg-primary/10 text-primary border-primary/30",
                        veto.status === "in_progress" &&
                          "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
                        veto.status === "waiting" &&
                          "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {veto.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
