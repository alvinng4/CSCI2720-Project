import React from "react";
import { Button } from "@/components/ui/button";
import { adminStore } from "@/lib/adminStore";

function UserForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [email, setEmail] = React.useState(initial?.email ?? "");
  const [role, setRole] = React.useState(initial?.role ?? "user");

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit({ name, email, role }); }}
      className="grid grid-cols-1 gap-3 md:grid-cols-4"
    >
      <input className="rounded-md border p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="rounded-md border p-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <select className="rounded-md border p-2" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <div className="flex gap-2">
        <Button type="submit">{initial ? "Save" : "Create"}</Button>
        {onCancel ? <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button> : null}
      </div>
    </form>
  );
}

export function UsersAdmin() {
  const [rows, setRows] = React.useState(() => adminStore.listUsers());
  const [editingId, setEditingId] = React.useState(null);

  const handleCreate = (p) => { adminStore.createUser(p); setRows(adminStore.listUsers()); };
  const handleSave = (id, p) => { adminStore.updateUser(id, p); setRows(adminStore.listUsers()); setEditingId(null); };
  const handleDelete = (id) => { if (confirm("Delete this user?")) { adminStore.deleteUser(id); setRows(adminStore.listUsers()); } };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border p-4">
        <h2 className="mb-2 text-lg font-semibold">Create User</h2>
        <UserForm onSubmit={handleCreate} />
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-none">
                  <td className="px-3 py-2">
                    {editingId === r.id ? (
                      <UserForm initial={r} onSubmit={(p) => handleSave(r.id, p)} onCancel={() => setEditingId(null)} />
                    ) : r.name}
                  </td>
                  <td className="px-3 py-2">{editingId === r.id ? null : r.email}</td>
                  <td className="px-3 py-2">{editingId === r.id ? null : r.role}</td>
                  <td className="px-3 py-2">
                    {editingId === r.id ? null : (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingId(r.id)}>Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(r.id)}>Delete</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={4}>No users yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
