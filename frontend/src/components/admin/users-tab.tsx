"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Download, UserPlus, MoreVertical, Pencil } from "lucide-react";

import { api, API_URL, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function AdminUsersTab() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => api.get<{ users: User[] }>(`/api/users?${search ? `search=${search}` : ""}`),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/users/${id}/suspend`),
    onSuccess: () => {
      toast.success("User suspended");
      invalidate();
    },
  });
  const activateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/users/${id}/activate`),
    onSuccess: () => {
      toast.success("User activated");
      invalidate();
    },
  });
  const membershipMutation = useMutation({
    mutationFn: ({ id, membership }: { id: string; membership: string }) =>
      api.patch(`/api/users/${id}/membership`, { membership }),
    onSuccess: () => {
      toast.success("Membership updated");
      invalidate();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      toast.success("User deleted");
      invalidate();
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`${API_URL}/api/users/export`} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" /> Export CSV
            </a>
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <CreateUserDialog onSuccess={() => { setCreateOpen(false); invalidate(); }} />
          </Dialog>
        </div>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        {editingUser && (
          <EditUserDialog
            user={editingUser}
            onSuccess={() => {
              setEditingUser(null);
              invalidate();
            }}
          />
        )}
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Membership</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-foreground/50">Loading users...</TableCell>
            </TableRow>
          )}
          {data?.users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.fullName}</TableCell>
              <TableCell className="text-foreground/60">{u.email}</TableCell>
              <TableCell>
                <Badge variant={u.role === "ADMIN" ? "default" : "neutral"}>{u.role}</Badge>
              </TableCell>
              <TableCell className="text-xs">{u.membership.replace("_", " ")}</TableCell>
              <TableCell>
                <Badge variant={u.status === "ACTIVE" ? "success" : u.status === "SUSPENDED" ? "danger" : "warning"}>
                  {u.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditingUser(u)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit Details
                    </DropdownMenuItem>
                    {u.status === "ACTIVE" ? (
                      <DropdownMenuItem onSelect={() => suspendMutation.mutate(u.id)}>Suspend</DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onSelect={() => activateMutation.mutate(u.id)}>
                        {u.status === "PENDING_VERIFICATION" ? "Approve & Verify" : "Activate"}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => membershipMutation.mutate({ id: u.id, membership: "VIP_MONTHLY" })}>
                      Upgrade to VIP Monthly
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => membershipMutation.mutate({ id: u.id, membership: "VIP_LIFETIME" })}>
                      Upgrade to VIP Lifetime
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => membershipMutation.mutate({ id: u.id, membership: "FREE" })}>
                      Downgrade to Free
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-danger"
                      onSelect={() => {
                        if (confirm(`Delete user ${u.email}? This cannot be undone.`)) deleteMutation.mutate(u.id);
                      }}
                    >
                      Delete User
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

function CreateUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "FREE", membership: "FREE" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/users", form);
      toast.success("User created");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New User</DialogTitle>
      </DialogHeader>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Membership</Label>
            <Select value={form.membership} onValueChange={(v) => setForm({ ...form, membership: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="VIP_MONTHLY">VIP Monthly</SelectItem>
                <SelectItem value="VIP_LIFETIME">VIP Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EditUserDialog({ user, onSuccess }: { user: User; onSuccess: () => void }) {
  const [form, setForm] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || "",
    country: user.country || "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/api/users/${user.id}`, form);
      toast.success("User updated");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
      </DialogHeader>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
