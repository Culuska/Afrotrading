"use client";

import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { api } from "@/lib/api";
import type { EducationContent } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProgressEntry {
  id: string;
  completed: boolean;
  progressPct: number;
  content: EducationContent;
}

export function EducationProgressTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["education-progress"],
    queryFn: () => api.get<{ progress: ProgressEntry[] }>("/api/users/me/education-progress"),
  });

  if (isLoading) return <p className="text-foreground/50">Loading progress...</p>;

  if (!data?.progress.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-foreground/50">
        <GraduationCap className="h-10 w-10" />
        <p>Start exploring the Education Center to track your progress here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.progress.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="flex-1">
              <p className="font-semibold">{entry.content.title}</p>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={entry.progressPct} className="w-40" />
                <span className="text-xs text-foreground/50">{entry.progressPct}%</span>
              </div>
            </div>
            <Badge variant={entry.completed ? "success" : "neutral"}>
              {entry.completed ? "Completed" : "In Progress"}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
