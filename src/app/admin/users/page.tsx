"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Search, Trash2, ShieldCheck,
  User, ToggleLeft, ToggleRight, Users,
} from "lucide-react";

import { useAdminStore } from "@/store/admin.store";
import { formatDate, cn } from "@/lib/utils";
import type { AdminUser } from "@/types";

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  user,
  onConfirm,
  onClose,
}: {
  user:      AdminUser;
  onConfirm: () => void;
  onClose:   () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-3xl shadow-hard border border-border w-full max-w-sm p-6 animate-scale-in">
        <div className="w-12 h-12 rounded-2xl bg-feedback-error-bg flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-feedback-error" />
        </div>
        <h3 className="font-display text-lg font-bold text-ink text-center mb-1">Remove user?</h3>
        <p className="text-sm text-ink-secondary text-center mb-6">
          <span className="font-semibold text-ink">{user.name}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-ink-secondary hover:bg-surface-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); toast.success("User removed."); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-feedback-error text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: "user" | "admin" }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
      <ShieldCheck className="w-3 h-3" />
      Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-tertiary text-ink-secondary border border-border">
      <User className="w-3 h-3" />
      User
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, active }: { name: string; active: boolean }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative shrink-0">
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold",
        active ? "bg-brand-100 text-brand-700" : "bg-surface-tertiary text-ink-tertiary"
      )}>
        {initials}
      </div>
      <span className={cn(
        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface",
        active ? "bg-feedback-success" : "bg-ink-disabled"
      )} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterTab = "all" | "user" | "admin";

export default function AdminUsersPage() {
  const users           = useAdminStore((s) => s.users);
  const toggleActive    = useAdminStore((s) => s.toggleUserActive);
  const deleteUser      = useAdminStore((s) => s.deleteUser);
  const updateUserRole  = useAdminStore((s) => s.updateUserRole);

  const [search,     setSearch]     = useState("");
  const [tab,        setTab]        = useState<FilterTab>("all");
  const [deletingId, setDeletingId] = useState<string | undefined>();

  // ── Filter ──

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase())  ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchTab = tab === "all" || u.role === tab;
    return matchSearch && matchTab;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount  = users.filter((u) => u.role === "user").length;
  const activeCount = users.filter((u) => u.active).length;

  const deletingUser = users.find((u) => u.id === deletingId);

  return (
    <>
      <div className="space-y-5 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Users</h1>
            <p className="text-sm text-ink-secondary mt-0.5">
              {filtered.length} of {users.length} users · {activeCount} active
            </p>
          </div>
          {/* Summary chips */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 rounded-full border border-brand-200">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-xs font-semibold text-brand-700">{adminCount} admins</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-tertiary rounded-full border border-border">
              <User className="w-3.5 h-3.5 text-ink-secondary" />
              <span className="text-xs font-semibold text-ink-secondary">{userCount} users</span>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs */}
          <div className="flex bg-surface-secondary border border-border rounded-xl p-1 gap-1">
            {(["all", "user", "admin"] as FilterTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                  tab === t
                    ? "bg-surface text-ink shadow-soft border border-border"
                    : "text-ink-tertiary hover:text-ink"
                )}
              >
                {t === "all" ? `All (${users.length})` : t === "admin" ? `Admins (${adminCount})` : `Users (${userCount})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-ink placeholder:text-ink-disabled outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary hidden md:table-cell">Joined</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-ink-secondary">Role</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-ink-secondary">Active</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-ink-tertiary text-sm">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-secondary transition-colors group">
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} active={user.active} />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-ink group-hover:text-brand-600 transition-colors truncate max-w-[140px]">
                              {user.name}
                            </div>
                            <div className="text-2xs text-ink-tertiary truncate max-w-[140px]">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Phone */}
                      <td className="px-4 py-3 text-xs text-ink-secondary hidden sm:table-cell font-mono">
                        {user.phone}
                      </td>
                      {/* Joined */}
                      <td className="px-4 py-3 text-xs text-ink-tertiary hidden md:table-cell">
                        {formatDate(user.createdAt)}
                      </td>
                      {/* Role */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            const newRole = user.role === "admin" ? "user" : "admin";
                            updateUserRole(user.id, newRole);
                            toast.success(`${user.name} is now ${newRole === "admin" ? "an Admin" : "a User"}.`);
                          }}
                          className="transition-transform hover:scale-105"
                          title="Click to toggle role"
                        >
                          <RoleBadge role={user.role} />
                        </button>
                      </td>
                      {/* Active toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            toggleActive(user.id);
                            toast.success(user.active ? `${user.name} deactivated.` : `${user.name} activated.`);
                          }}
                          className="transition-transform hover:scale-110"
                          aria-label="Toggle active"
                        >
                          {user.active
                            ? <ToggleRight className="w-6 h-6 text-feedback-success" />
                            : <ToggleLeft  className="w-6 h-6 text-ink-disabled"     />
                          }
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDeletingId(user.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center ml-auto text-ink-tertiary hover:text-feedback-error hover:bg-feedback-error-bg transition-all"
                          aria-label="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deletingUser && (
        <DeleteConfirm
          user={deletingUser}
          onConfirm={() => deleteUser(deletingUser.id)}
          onClose={() => setDeletingId(undefined)}
        />
      )}
    </>
  );
}