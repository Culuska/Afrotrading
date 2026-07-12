"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, MoreVertical, Copy, Archive, Send, Trash2, Upload, Loader2 } from "lucide-react";

import { api, uploadFile, ApiError } from "@/lib/api";
import type { Signal, SignalStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS: SignalStatus[] = ["PENDING", "RUNNING", "HIT_TP1", "HIT_TP2", "HIT_TP3", "STOPPED_OUT", "CLOSED", "CANCELLED"];

export function AdminSignalsTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "signals"],
    queryFn: () => api.get<{ signals: Signal[] }>("/api/signals/admin/all?limit=100"),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "signals"] });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SignalStatus }) => api.patch(`/api/signals/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("Status updated");
      invalidate();
    },
  });
  const publishMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/signals/${id}/publish`),
    onSuccess: () => {
      toast.success("Signal published to Telegram");
      invalidate();
    },
  });
  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/signals/${id}/duplicate`),
    onSuccess: () => {
      toast.success("Signal duplicated");
      invalidate();
    },
  });
  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/signals/${id}/archive`),
    onSuccess: () => {
      toast.success("Signal archived");
      invalidate();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/signals/${id}`),
    onSuccess: () => {
      toast.success("Signal deleted");
      invalidate();
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingSignal(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSignal(null)}>
              <Plus className="h-4 w-4" /> New Signal
            </Button>
          </DialogTrigger>
          <SignalFormDialog
            key={editingSignal?.id ?? "new"}
            signal={editingSignal}
            onSuccess={() => {
              setDialogOpen(false);
              invalidate();
            }}
          />
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Pair</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-foreground/50">Loading signals...</TableCell>
            </TableRow>
          )}
          {data?.signals.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.signalNumber}</TableCell>
              <TableCell className="font-medium">{s.pair}</TableCell>
              <TableCell className={s.direction === "BUY" ? "text-success" : "text-danger"}>{s.direction}</TableCell>
              <TableCell>{s.entryPrice}</TableCell>
              <TableCell>
                <Select value={s.status} onValueChange={(v) => statusMutation.mutate({ id: s.id, status: v as SignalStatus })}>
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {s.isPublished ? <Badge variant="success">Published</Badge> : <span className="text-xs text-foreground/40">Draft</span>}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-foreground/50">{formatDate(s.createdAt)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => {
                        setEditingSignal(s);
                        setDialogOpen(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    {!s.isPublished && (
                      <DropdownMenuItem onSelect={() => publishMutation.mutate(s.id)}>
                        <Send className="h-3.5 w-3.5" /> Publish + Send to Telegram
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => duplicateMutation.mutate(s.id)}>
                      <Copy className="h-3.5 w-3.5" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => archiveMutation.mutate(s.id)}>
                      <Archive className="h-3.5 w-3.5" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-danger"
                      onSelect={() => {
                        if (confirm("Delete this signal permanently?")) deleteMutation.mutate(s.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SignalFormDialog({ signal, onSuccess }: { signal: Signal | null; onSuccess: () => void }) {
  const [form, setForm] = useState({
    pair: signal?.pair || "XAUUSD",
    direction: signal?.direction || "BUY",
    entryPrice: signal?.entryPrice || "",
    stopLoss: signal?.stopLoss || "",
    takeProfit1: signal?.takeProfit1 || "",
    takeProfit2: signal?.takeProfit2 || "",
    takeProfit3: signal?.takeProfit3 || "",
    riskPercent: signal?.riskPercent || "1",
    notes: signal?.notes || "",
    chartImageUrl: signal?.chartImageUrl || "",
    vipOnly: signal?.vipOnly || false,
    isPublished: signal?.isPublished || false,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { asset } = await uploadFile<{ asset: { url: string } }>("/api/upload", file, "signals");
      setForm((f) => ({ ...f, chartImageUrl: asset.url }));
      toast.success("Chart image uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (signal) {
        await api.put(`/api/signals/${signal.id}`, form);
        toast.success("Signal updated");
      } else {
        await api.post("/api/signals", form);
        toast.success("Signal created");
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save signal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{signal ? "Edit Signal" : "Create New Signal"}</DialogTitle>
      </DialogHeader>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pair</Label>
            <Input value={form.pair} onChange={(e) => setForm({ ...form, pair: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v as "BUY" | "SELL" })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">BUY</SelectItem>
                <SelectItem value="SELL">SELL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Entry Price</Label>
            <Input required type="number" step="0.01" value={form.entryPrice} onChange={(e) => setForm({ ...form, entryPrice: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Stop Loss</Label>
            <Input required type="number" step="0.01" value={form.stopLoss} onChange={(e) => setForm({ ...form, stopLoss: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Risk %</Label>
            <Input type="number" step="0.1" value={form.riskPercent} onChange={(e) => setForm({ ...form, riskPercent: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Take Profit 1</Label>
            <Input required type="number" step="0.01" value={form.takeProfit1} onChange={(e) => setForm({ ...form, takeProfit1: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Take Profit 2</Label>
            <Input type="number" step="0.01" value={form.takeProfit2 ?? ""} onChange={(e) => setForm({ ...form, takeProfit2: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Take Profit 3</Label>
            <Input type="number" step="0.01" value={form.takeProfit3 ?? ""} onChange={(e) => setForm({ ...form, takeProfit3: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Chart Image</Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://res.cloudinary.com/..."
              value={form.chartImageUrl}
              onChange={(e) => setForm({ ...form, chartImageUrl: e.target.value })}
            />
            <Button type="button" variant="outline" disabled={uploading} asChild>
              <label className="cursor-pointer">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={uploading} />
              </label>
            </Button>
          </div>
          {form.chartImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.chartImageUrl} alt="Chart preview" className="mt-2 max-h-40 rounded-lg border border-white/10" />
          )}
        </div>

        <div className="space-y-2">
          <Label>Signal Notes</Label>
          <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.vipOnly} onCheckedChange={(v) => setForm({ ...form, vipOnly: !!v })} /> VIP Only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: !!v })} /> Publish now (sends to Telegram)
          </label>
        </div>

        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : signal ? "Save Changes" : "Create Signal"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
