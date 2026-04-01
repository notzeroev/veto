"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import { PlusIcon, Trash } from "@phosphor-icons/react";

export default function AdminDashboard() {
  const vetos = useQuery(api.vetos.listMyVetos);
  const deleteVeto = useMutation(api.vetos.deleteVeto);
  const [confirmingDelete, setConfirmingDelete] = useState<Id<"vetos"> | null>(null);

  const handleDelete = async (vetoId: Id<"vetos">) => {
    await deleteVeto({ vetoId });
    setConfirmingDelete(null);
  };

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
              <Card key={veto._id} className="p-4 hover:ring-muted-foreground/30 transition-all">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/admin/veto/${veto._id}`}
                    className="flex-1"
                  >
                    <div className="text-sm font-medium">
                      {veto.teamA.tag} vs {veto.teamB.tag}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {veto.name} - {veto.format.toUpperCase()}
                    </div>
                  </Link>
                  <div className="flex items-center gap-3">
                    {veto.status === "completed" ? (() => {
                      const maps = veto.actions
                        .filter((a) => a.type === "pick" || a.type === "decider")
                        .map((a) => a.map);
                      return maps.length > 0 ? (
                        <>
                          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                            {maps.map((map, i) => (
                              <span key={map} className="flex items-center gap-1.5">
                                {i > 0 && <span className="text-muted-foreground/50">›</span>}
                                <span>{map}</span>
                              </span>
                            ))}
                          </span>
                          <span className="sm:hidden text-xs text-muted-foreground">completed</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">completed</span>
                      );
                    })() : (
                      <span className="text-xs text-muted-foreground">
                        {veto.status.replace("_", " ")}
                      </span>
                    )}
                    {confirmingDelete === veto._id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Sure?</span>
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => handleDelete(veto._id)}
                        >
                          Yes
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setConfirmingDelete(null)}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => setConfirmingDelete(veto._id)}
                      >
                        <Trash className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
