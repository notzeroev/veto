"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PlusIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { MAP_POOLS, type Game } from "@/lib/mapPools";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FieldName =
  | "name"
  | "teamAName"
  | "teamATag"
  | "teamBName"
  | "teamBTag"
  | "selectedMaps"
  | "form";

type FieldErrors = Partial<Record<FieldName, string>>;

export function CreateVetoForm() {
  const router = useRouter();
  const createVeto = useMutation(api.vetos.create);

  const [game, setGame] = useState<Game>("valorant");
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"bo1" | "bo3" | "bo5">("bo3");
  const [teamAName, setTeamAName] = useState("");
  const [teamATag, setTeamATag] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [teamBTag, setTeamBTag] = useState("");
  const [selectedMaps, setSelectedMaps] = useState<string[]>(
    MAP_POOLS[game].active,
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const mapPool = MAP_POOLS[game];

  const validateField = (
    field: Exclude<FieldName, "form">,
    value: string | string[],
  ): string | undefined => {
    switch (field) {
      case "name":
        return typeof value === "string" && value.trim().length > 0
          ? undefined
          : "Add a match name.";
      case "teamAName":
        return typeof value === "string" &&
          value.trim().length >= 1 &&
          value.trim().length <= 20
          ? undefined
          : "Name needs to be 1-20 characters.";
      case "teamATag":
        return typeof value === "string" &&
          value.trim().length >= 1 &&
          value.trim().length <= 5
          ? undefined
          : "Tag needs to be 1-5 characters.";
      case "teamBName":
        return typeof value === "string" &&
          value.trim().length >= 1 &&
          value.trim().length <= 20
          ? undefined
          : "Name needs to be 1-20 characters.";
      case "teamBTag":
        return typeof value === "string" &&
          value.trim().length >= 1 &&
          value.trim().length <= 5
          ? undefined
          : "Tag needs to be 1-5 characters.";
      case "selectedMaps":
        return Array.isArray(value) && value.length === 7
          ? undefined
          : "Select exactly 7 maps.";
    }
  };

  const updateFieldError = (
    field: Exclude<FieldName, "form">,
    value: string | string[],
  ) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      const message = validateField(field, value);
      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const setStringField =
    (
      field: Exclude<FieldName, "selectedMaps" | "form">,
      setter: (value: string) => void,
    ) =>
    (value: string) => {
      setter(value);
      updateFieldError(field, value);
    };

  const toggleMap = (map: string) => {
    const nextSelectedMaps = selectedMaps.includes(map)
      ? selectedMaps.filter((selectedMap) => selectedMap !== map)
      : selectedMaps.length >= 7
        ? selectedMaps
        : [...selectedMaps, map];

    setSelectedMaps(nextSelectedMaps);
    updateFieldError("selectedMaps", nextSelectedMaps);
  };

  const getInputProps = (
    field: Exclude<FieldName, "selectedMaps" | "form">,
  ): Pick<ComponentProps<typeof Input>, "aria-invalid"> => ({
    "aria-invalid": errors[field] ? true : undefined,
  });

  const renderLabel = (
    label: ReactNode,
    field: Exclude<FieldName, "selectedMaps" | "form">,
  ) => (
    <div className="flex items-center gap-2">
      <Label>{label}</Label>
      {errors[field] && (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={errors[field]}
                className="inline-flex text-destructive"
              />
            }
          >
            <WarningCircleIcon className="size-4" weight="fill" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            sideOffset={6}
            className="border border-destructive/30 bg-destructive px-3 py-2 text-primary-foreground"
          >
            {errors[field]}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedTeamAName = teamAName.trim();
    const trimmedTeamATag = teamATag.trim();
    const trimmedTeamBName = teamBName.trim();
    const trimmedTeamBTag = teamBTag.trim();

    const nextErrors: FieldErrors = {
      name: validateField("name", trimmedName),
      teamAName: validateField("teamAName", trimmedTeamAName),
      teamATag: validateField("teamATag", trimmedTeamATag),
      teamBName: validateField("teamBName", trimmedTeamBName),
      teamBTag: validateField("teamBTag", trimmedTeamBTag),
      selectedMaps: validateField("selectedMaps", selectedMaps),
    };
    const filteredErrors = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => Boolean(value)),
    ) as FieldErrors;

    setErrors(filteredErrors);
    if (Object.keys(filteredErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const vetoId = await createVeto({
        game,
        name: trimmedName,
        format,
        teamAName: trimmedTeamAName,
        teamATag: trimmedTeamATag,
        teamBName: trimmedTeamBName,
        teamBTag: trimmedTeamBTag,
        mapPool: selectedMaps,
      });
      router.push(`/admin/veto/${vetoId}`);
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Failed to create veto",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 max-w-2xl mx-auto"
      >
      <div className="space-y-2">
        {renderLabel("Match Name", "name")}
        <Input
          type="text"
          value={name}
          onChange={(e) => setStringField("name", setName)(e.target.value)}
          placeholder="e.g. Upper Finals"
          className="h-10"
          {...getInputProps("name")}
        />
      </div>

      <div className="space-y-2">
        <Label>Game</Label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setGame("valorant")}
            className={cn(
              "flex-1",
              game === "valorant"
                ? "bg-neutral/20! border-neutral!"
                : "hover:bg-muted! dark:hover:bg-input/30! hover:border-neutral!",
            )}
          >
            VALORANT
          </Button>
          <Tooltip>
            <TooltipTrigger className="flex-1" render={<span />}>
              <Button
                type="button"
                variant="outline"
                disabled
                className="w-full opacity-50 cursor-not-allowed pointer-events-none"
              >
                CS2
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon :)</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Format</Label>
        <div className="flex gap-3">
          {(["bo1", "bo3", "bo5"] as const).map((f) => (
            <Button
              key={f}
              type="button"
              variant="outline"
              onClick={() => setFormat(f)}
              className={cn(
                "flex-1",
                format === f
                  ? "bg-neutral/20! border-neutral!"
                  : "hover:bg-muted! dark:hover:bg-input/30! hover:border-neutral!",
              )}
            >
              {f.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2">{renderLabel("Team A", "teamAName")}</div>
          <Input
            type="text"
            value={teamAName}
            onChange={(e) =>
              setStringField("teamAName", setTeamAName)(e.target.value)
            }
            placeholder="Name (1-20)"
            className="h-10"
            maxLength={20}
            {...getInputProps("teamAName")}
          />
          <div className="mt-2">
            <div className="mb-2">{renderLabel("Tag", "teamATag")}</div>
            <Input
              type="text"
              value={teamATag}
              onChange={(e) =>
                setStringField("teamATag", setTeamATag)(
                  e.target.value.toUpperCase(),
                )
              }
              placeholder="TAG (1-5)"
              className="h-10 uppercase"
              maxLength={5}
              {...getInputProps("teamATag")}
            />
          </div>
        </div>
        <div>
          <div className="mb-2">{renderLabel("Team B", "teamBName")}</div>
          <Input
            type="text"
            value={teamBName}
            onChange={(e) =>
              setStringField("teamBName", setTeamBName)(e.target.value)
            }
            placeholder="Name (1-20)"
            className="h-10"
            maxLength={20}
            {...getInputProps("teamBName")}
          />
          <div className="mt-2">
            <div className="mb-2">{renderLabel("Tag", "teamBTag")}</div>
            <Input
              type="text"
              value={teamBTag}
              onChange={(e) =>
                setStringField("teamBTag", setTeamBTag)(
                  e.target.value.toUpperCase(),
                )
              }
              placeholder="TAG (1-5)"
              className="h-10 uppercase"
              maxLength={5}
              {...getInputProps("teamBTag")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Map Pool ({selectedMaps.length}/7 selected)</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {mapPool.maps.map((map) => {
            const isSelected = selectedMaps.includes(map);

            return (
              <Button
                key={map}
                type="button"
                variant="outline"
                onClick={() => toggleMap(map)}
                className={cn(
                  "h-9 text-sm",
                  errors.selectedMaps &&
                    "border-destructive text-destructive hover:border-destructive",
                  isSelected
                    ? "bg-neutral/20! border-neutral!"
                    : "hover:bg-muted! dark:hover:bg-input/30! hover:border-neutral!",
                )}
              >
                {map}
              </Button>
            );
          })}
        </div>
        {errors.selectedMaps && (
          <p className="text-destructive text-xs">{errors.selectedMaps}</p>
        )}
      </div>

      {errors.form && (
        <div className="text-destructive text-sm bg-destructive/10 px-4 py-2 border border-destructive/20">
          {errors.form}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        variant="constructive"
        className="w-full h-10"
      >
        <PlusIcon className="size-4" />
        {loading ? "Creating..." : "Create Veto"}
      </Button>
      </form>
    </TooltipProvider>
  );
}
