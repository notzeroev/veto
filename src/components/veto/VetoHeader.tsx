"use client";

type Props = {
  name: string;
  teamAName: string;
  teamBName: string;
  format: "bo1" | "bo3" | "bo5";
};

export function VetoHeader({ name, teamAName, teamBName, format }: Props) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-semibold mb-2">
        {teamAName} vs {teamBName}
      </h1>
      <div className="text-sm text-muted-foreground">
        {name} - {format.toUpperCase()}
      </div>
    </div>
  );
}
