"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";

import { api, uploadFile, ApiError } from "@/lib/api";
import type { MarketAnalysis, AnalysisTimeframe, AnalysisType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function AdminMarketAnalysisTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketAnalysis | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "market-analysis"],
    queryFn: () => api.get<{ analysis: MarketAnalysis[] }>("/api/market-analysis/admin/all"),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "market-analysis"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/market-analysis/${id}`),
    onSuccess: () => {
      toast.success("Analysis deleted");
      invalidate();
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4" /> Add Analysis
            </Button>
          </DialogTrigger>
          <AnalysisFormDialog
            key={editing?.id ?? "new"}
            analysis={editing}
            onSuccess={() => { setDialogOpen(false); invalidate(); }}
          />
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Timeframe</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-foreground/50">Loading analysis...</TableCell>
            </TableRow>
          )}
          {data?.analysis.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell><Badge variant="neutral">{item.timeframe}</Badge></TableCell>
              <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
              <TableCell>
                <Badge variant={item.published ? "success" : "neutral"}>{item.published ? "Published" : "Draft"}</Badge>
                {item.vipOnly && <Badge className="ml-1">VIP</Badge>}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(item); setDialogOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { if (confirm("Delete this analysis?")) deleteMutation.mutate(item.id); }}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AnalysisFormDialog({ analysis, onSuccess }: { analysis: MarketAnalysis | null; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: analysis?.title || "",
    summary: analysis?.summary || "",
    body: analysis?.body || "",
    timeframe: analysis?.timeframe || "DAILY",
    type: analysis?.type || "TECHNICAL",
    pair: analysis?.pair || "XAUUSD",
    chartImageUrl: analysis?.chartImageUrl || "",
    videoUrl: analysis?.videoUrl || "",
    vipOnly: analysis?.vipOnly || false,
    published: analysis?.published ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { asset } = await uploadFile<{ asset: { url: string } }>("/api/upload", file, "market-analysis");
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
      if (analysis) {
        await api.put(`/api/market-analysis/${analysis.id}`, form);
        toast.success("Analysis updated");
      } else {
        await api.post("/api/market-analysis", form);
        toast.success("Analysis created");
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save analysis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{analysis ? "Edit Analysis" : "Add Market Analysis"}</DialogTitle>
      </DialogHeader>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Summary</Label>
          <Textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Timeframe</Label>
            <Select value={form.timeframe} onValueChange={(v) => setForm({ ...form, timeframe: v as AnalysisTimeframe })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AnalysisType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TECHNICAL">Technical</SelectItem>
                <SelectItem value="FUNDAMENTAL">Fundamental</SelectItem>
              </SelectContent>
            </Select>
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
            <img src={form.chartImageUrl} alt="Chart preview" className="mt-2 max-h-40 rounded-lg border border-black/10" />
          )}
        </div>
        <div className="space-y-2">
          <Label>Full Analysis</Label>
          <Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.vipOnly} onCheckedChange={(v) => setForm({ ...form, vipOnly: !!v })} /> VIP Only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: !!v })} /> Published
          </label>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : analysis ? "Save Changes" : "Create Analysis"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
