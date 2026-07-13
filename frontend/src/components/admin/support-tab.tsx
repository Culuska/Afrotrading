"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Mail, Phone } from "lucide-react";

import { api } from "@/lib/api";
import type { ContactMessage } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export function AdminSupportTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "contact-messages"],
    queryFn: () => api.get<{ messages: ContactMessage[] }>("/api/contact/admin/all"),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/contact/${id}/resolve`),
    onSuccess: () => {
      toast.success("Marked as resolved");
      queryClient.invalidateQueries({ queryKey: ["admin", "contact-messages"] });
    },
  });

  if (isLoading) {
    return <p className="py-8 text-center text-foreground/50">Loading messages...</p>;
  }

  if (!data?.messages.length) {
    return <p className="py-8 text-center text-foreground/50">No support messages yet.</p>;
  }

  return (
    <div className="space-y-4">
      {data.messages.map((msg) => (
        <Card key={msg.id}>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg font-semibold">{msg.name}</p>
                  <Badge variant={msg.resolved ? "success" : "warning"}>
                    {msg.resolved ? "Resolved" : "Open"}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-foreground/60">
                  <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 hover:text-gold-400">
                    <Mail className="h-3.5 w-3.5" /> {msg.email}
                  </a>
                  {msg.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {msg.phone}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-foreground/40">{formatDate(msg.createdAt)}</p>
            </div>

            {msg.subject && <p className="mt-4 font-medium">{msg.subject}</p>}
            <p className="mt-2 whitespace-pre-line text-sm text-foreground/70">{msg.message}</p>

            {!msg.resolved && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => resolveMutation.mutate(msg.id)}
                disabled={resolveMutation.isPending}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
