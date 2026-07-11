"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Signal } from "@/lib/types";
import { SignalCard } from "@/components/signal-card";
import { Button } from "@/components/ui/button";

interface SavedSignalEntry {
  id: string;
  signal: Signal;
}

export function SavedSignalsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["saved-signals"],
    queryFn: () => api.get<{ savedSignals: SavedSignalEntry[] }>("/api/users/me/saved-signals"),
  });

  const removeMutation = useMutation({
    mutationFn: (signalId: string) => api.delete(`/api/users/me/saved-signals/${signalId}`),
    onSuccess: () => {
      toast.success("Removed from saved signals");
      queryClient.invalidateQueries({ queryKey: ["saved-signals"] });
    },
  });

  if (isLoading) return <p className="text-foreground/50">Loading saved signals...</p>;

  if (!data?.savedSignals.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-foreground/50">
        <Bookmark className="h-10 w-10" />
        <p>You haven&apos;t saved any signals yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {data.savedSignals.map((entry) => (
        <div key={entry.id} className="space-y-2">
          <SignalCard signal={entry.signal} />
          <Button variant="ghost" size="sm" className="w-full" onClick={() => removeMutation.mutate(entry.signal.id)}>
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
