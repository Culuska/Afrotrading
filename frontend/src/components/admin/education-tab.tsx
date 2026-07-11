"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import type { EducationContent, EducationType, EducationCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const TYPES: EducationType[] = ["VIDEO", "PDF", "IMAGE", "ARTICLE"];
const CATEGORIES: EducationCategory[] = [
  "MARKET_ANALYSIS", "TRADING_PSYCHOLOGY", "RISK_MANAGEMENT", "GOLD_ANALYSIS",
  "FOREX_EDUCATION", "VIDEO_LESSONS", "ARTICLES", "WEEKLY_ANALYSIS", "TRADING_JOURNAL",
];

export function AdminEducationTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EducationContent | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "education"],
    queryFn: () => api.get<{ content: EducationContent[] }>("/api/education/admin/all"),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "education"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/education/${id}`),
    onSuccess: () => {
      toast.success("Content deleted");
      invalidate();
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4" /> Add Content
            </Button>
          </DialogTrigger>
          <EducationFormDialog content={editing} onSuccess={() => { setDialogOpen(false); invalidate(); }} />
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-foreground/50">Loading content...</TableCell>
            </TableRow>
          )}
          {data?.content.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell><Badge variant="neutral">{item.type}</Badge></TableCell>
              <TableCell className="text-xs">{item.category.replace(/_/g, " ")}</TableCell>
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
                  onClick={() => { if (confirm("Delete this content?")) deleteMutation.mutate(item.id); }}
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

function EducationFormDialog({ content, onSuccess }: { content: EducationContent | null; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: content?.title || "",
    description: content?.description || "",
    type: content?.type || "ARTICLE",
    category: content?.category || "GOLD_ANALYSIS",
    youtubeUrl: content?.youtubeUrl || "",
    fileUrl: content?.fileUrl || "",
    imageUrl: content?.imageUrl || "",
    body: content?.body || "",
    featured: content?.featured || false,
    vipOnly: content?.vipOnly || false,
    published: content?.published ?? true,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (content) {
        await api.put(`/api/education/${content.id}`, form);
        toast.success("Content updated");
      } else {
        await api.post("/api/education", form);
        toast.success("Content created");
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save content");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{content ? "Edit Content" : "Add Education Content"}</DialogTitle>
      </DialogHeader>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as EducationType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as EducationCategory })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {form.type === "VIDEO" && (
          <div className="space-y-2">
            <Label>YouTube URL</Label>
            <Input value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} />
          </div>
        )}
        {form.type === "PDF" && (
          <div className="space-y-2">
            <Label>PDF File URL</Label>
            <Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
          </div>
        )}
        {form.type === "IMAGE" && (
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>
        )}
        {form.type === "ARTICLE" && (
          <div className="space-y-2">
            <Label>Article Body</Label>
            <Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
        )}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: !!v })} /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.vipOnly} onCheckedChange={(v) => setForm({ ...form, vipOnly: !!v })} /> VIP Only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: !!v })} /> Published
          </label>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : content ? "Save Changes" : "Create Content"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
