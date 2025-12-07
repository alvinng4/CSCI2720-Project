import { adminStore } from "@/lib/adminStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions }  from "@/components/ui/data-table-view-options"
import { Input } from "@/components/ui/input"
import { PageShell } from "@/components/page-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  createContext,
  useContext,
  useMemo,
  useState
} from "react";

const UserTableContext = createContext(null);

export function UserManager() {
  const [rows, setRows] = useState(() => adminStore.listUsers());
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [editingEmail, setEditingEmail] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  /* Handlers */
  function createUser(userData) {
    adminStore.createUser(userData);
    setRows(adminStore.listUsers());
  }

  function startEditing(id) {
    const editingUser = rows.find((user) => user.id === id);
    if (editingUser) {
      setEditingId(id);
      setEditingName(editingUser.name);
      setEditingEmail(editingUser.email);
      setEditingRole(editingUser.role);
    }
  }

  function stopEditing() {
    setEditingId(null);
    setEditingName(null);
    setEditingEmail(null);
    setEditingRole(null);
  }

  function saveEdit(id) {
    const patch = { name: editingName, email: editingEmail, role: editingRole };

    if (!patch.name?.trim()) return alert("Name is required");
    if (!patch.email?.trim()) return alert("Email is required");
    if (!patch.role?.trim()) return alert("Role is required");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(patch.email)) {
      alert("Please enter a valid email address");
      return;
    }

    adminStore.updateUser(id, patch);
    setRows(adminStore.listUsers());
    stopEditing();
  }

  function handleDelete(id) {
    const userConsent = confirm("Delete this user?");
    if (userConsent) {
      adminStore.deleteUser(id);
      setRows(adminStore.listUsers());
    }
  }

  /* Columns (created once only to prevent input issues) */
  const columns = useMemo(() => [
    {
      accessorKey: "name",
      title: "Name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <NameCell row={row} />,
    },
    {
      accessorKey: "email",
      title: "Email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <EmailCell row={row} />,
    },
    {
      accessorKey: "role",
      title: "Role",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => <RoleCell row={row} />,
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionsCell row={row} />,
    },
  ], []);

  /* Context values for table */
  const contextValue = {
    editingId,
    editingName,
    setEditingName,
    editingEmail,
    setEditingEmail,
    editingRole,
    setEditingRole,
    startEditing,
    stopEditing,
    saveEdit,
    handleDelete
  };

  return (
    <PageShell title="User Manager (Admin only)">
      <div className="flex flex-col gap-6">
        <UserTableContext.Provider value={contextValue}>
          <DataTable columns={columns} data={rows} renderSideMenu={CreateUserSideMenu} renderToolbar={toolBar}/>
        </UserTableContext.Provider>
      </div>
    </PageShell>
  );
}

/* User table cell components */
function NameCell({ row }) {
  const { editingId, editingName, setEditingName } = useContext(UserTableContext);
  const isEditing = (editingId === row.original.id);

  if (isEditing) {
    return (
      <Input 
        value={editingName ?? ""} 
        onChange={(e) => setEditingName(e.target.value)} 
        autoFocus // Optional: nice UX
      />
    );
  }
  return row.original.name;
}

function EmailCell({ row }) {
  const { editingId, editingEmail, setEditingEmail } = useContext(UserTableContext);
  const isEditing = (editingId === row.original.id);

  if (isEditing) {
    return (
      <Input 
        type="email" 
        value={editingEmail ?? ""} 
        onChange={(e) => setEditingEmail(e.target.value)} 
      />
    );
  }
  return row.original.email;
}

function RoleCell({ row }) {
  const { editingId, editingRole, setEditingRole } = useContext(UserTableContext);
  const isEditing = (editingId === row.original.id);

  if (isEditing) {
    return (
      <Select value={editingRole} onValueChange={setEditingRole}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    );
  }
  return row.original.role;
}

function ActionsCell({ row }) {
  const { 
    editingId, 
    stopEditing, 
    saveEdit, 
    startEditing, 
    handleDelete 
  } = useContext(UserTableContext);
  
  const isEditing = (editingId === row.original.id);

  if (isEditing) {
    return (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={stopEditing}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => saveEdit(row.original.id)}>
          Save
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" onClick={() => startEditing(row.original.id)}>
        Edit
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original.id)}>
        Delete
      </Button>
    </div>
  );
}

/* Create user side menu */
function CreateUserSideMenu({ initial, onSubmit }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState(initial?.role ?? "user");

  return (
    <Card className="bg-transparent shadow-none gap-2">
      <CardHeader>
        <CardTitle>
          <span>Create User</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form
          onSubmit={(e) => { 
            e.preventDefault();
            onSubmit({ name, email, role });
            setName("");
            setEmail("");
            setRole("");
          }}
          className="flex flex-col gap-3"
        >
          <Input placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Select
            value={role}
            onValueChange={(value) => setRole(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Role" value={role} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit">
            {initial ? "Save" : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/* Search tool bar */
function toolBar(table) {
  return (
    <div className="flex items-end gap-x-2">
      <Input
        placeholder="Search by name"
        value={(table.getColumn("name")?.getFilterValue()) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
      />
      <Input
        placeholder="Search by email"
        value={(table.getColumn("email")?.getFilterValue()) ?? ""}
        onChange={(event) =>
          table.getColumn("email")?.setFilterValue(event.target.value)
        }
      />
      <DataTableViewOptions table={table} />
    </div>
  )
}