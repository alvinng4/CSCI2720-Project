import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { Input } from "@/components/ui/input";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import { PageShell } from "@/components/page-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, createContext, useContext, useMemo, useState } from "react";
import { getToken, isAdmin } from "@/lib/AuthHelpers";

const UserTableContext = createContext(null);

export function UserManager() {
  const [rows, setRows] = useState([]);
  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();

  async function fetchUsers() {
    let res = null;
    try {
      res = await fetch(`http://localhost:4000/api/users`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${getToken()}`,
        },
      });
    } catch {
      showMessage(
        "Network error when fetching user data. Please try again later.",
        MessageTypes.ERROR
      );
    }

    const data = await res.json();
    const mappedData = data.map((users) => ({
      id: users._id,
      name: users.username,
      email: users.email,
      role: users.role,
    }));
    setRows(mappedData);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [editingEmail, setEditingEmail] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  /* Handlers */
  async function createUser(userData) {
    resetMessage();

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 25; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    userData.password = password;

    const mappedData = [userData].map((user) => ({
      username: user.name,
      email: user.email,
      role: user.role,
      password: user.password,
    }));

    let res = null;
    try {
      res = await fetch(`http://localhost:4000/api/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getToken()}`,
        },

        body: JSON.stringify(mappedData[0]),
      });
    } catch {
      showMessage("Network error. Please try again later", MessageTypes.ERROR);
    }

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      showMessage(data?.message || "Some error occured", MessageTypes.ERROR);
      return;
    }

    showMessage(
      "New user created. Password: " + userData.password,
      MessageTypes.SPECIAL
    );
    fetchUsers();
    return true;
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

  async function saveEdit(id) {
    const patch = { name: editingName, email: editingEmail, role: editingRole };

    if (!patch.name?.trim()) {
      showMessage("Name is required", MessageTypes.ERROR);
      return;
    }
    if (!patch.email?.trim()) {
      showMessage("Email is required", MessageTypes.ERROR);
      return;
    }
    if (!patch.role?.trim()) {
      showMessage("Role is required", MessageTypes.ERROR);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+$/;
    if (!emailPattern.test(patch.email)) {
      showMessage("Please enter a valid email address", MessageTypes.ERROR);
      return;
    }

    if (!patch || !id) {
      showMessage("User data is invalid.", MessageTypes.ERROR);
      return;
    }

    let res = null;
    try {
      res = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(patch),
      });
    } catch {
      showMessage("Network error. Please try again later", MessageTypes.ERROR);
      return;
    }

    if (!res.ok) {
      const data = await res.text();
      showMessage(data, MessageTypes.ERROR);
      return;
    }

    stopEditing();
    resetMessage();
    fetchUsers();
  }

  async function handleDelete(id) {
    const userConsent = confirm("Delete this user?");
    if (userConsent) {
      let res = null;
      try {
        res = await fetch(`http://localhost:4000/api/users/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${getToken()}`,
          },
        });
      } catch {
        showMessage(
          "Network error. Please try again later.",
          MessageTypes.ERROR
        );
        return;
      }

      if (!res.ok) {
        const data = await res.text();
        showMessage(data, MessageTypes.ERROR);
        return;
      }
    }
    showMessage(
      `User with id ${id} is successfully deleted.`,
      MessageTypes.SPECIAL
    );
    fetchUsers();
  }

  /* Columns (created once only to prevent input issues) */
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        title: "Name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => <NameCell row={row} />,
      },
      {
        accessorKey: "email",
        title: "Email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => <EmailCell row={row} />,
      },
      {
        accessorKey: "role",
        title: "Role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => <RoleCell row={row} />,
      },
      {
        id: "actions",
        cell: ({ row }) => <ActionsCell row={row} />,
      },
    ],
    []
  );

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
    handleDelete,
  };

  return (
    <PageShell title="User Manager (Admin only)">
      {/* Feedback message */}
      <p hidden={!isShowMessage} className={MessageTypeToColor[messageType]}>
        {message}
      </p>
      {isAdmin && (
        <UserTableContext.Provider value={contextValue}>
          <DataTable
            columns={columns}
            data={rows}
            renderSideMenu={() => CreateUserSideMenu({ onSubmit: createUser })}
            renderToolbar={toolBar}
          />
        </UserTableContext.Provider>
      )}
    </PageShell>
  );
}

/* User table cell components */
function NameCell({ row }) {
  const { editingId, editingName, setEditingName } =
    useContext(UserTableContext);
  const isEditing = editingId === row.original.id;

  if (isEditing) {
    return (
      <Input
        value={editingName ?? ""}
        onChange={(e) => setEditingName(e.target.value)}
        autoFocus
      />
    );
  }
  return row.original.name;
}

function EmailCell({ row }) {
  const { editingId, editingEmail, setEditingEmail } =
    useContext(UserTableContext);
  const isEditing = editingId === row.original.id;

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
  const { editingId, editingRole, setEditingRole } =
    useContext(UserTableContext);
  const isEditing = editingId === row.original.id;

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
  const { editingId, stopEditing, saveEdit, startEditing, handleDelete } =
    useContext(UserTableContext);

  const isEditing = editingId === row.original.id;

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
      <Button
        size="sm"
        variant="outline"
        onClick={() => startEditing(row.original.id)}
      >
        Edit
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleDelete(row.original.id)}
      >
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
    <Card className="bg-transparent shadow-none gap-2 w-75">
      <CardHeader>
        <CardTitle>
          <span>Create User</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const result = await onSubmit({ name, email, role });
            if (result) {
              setName("");
              setEmail("");
            }
          }}
          className="flex flex-col gap-3"
        >
          <Input
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Select value={role} onValueChange={(value) => setRole(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Role" value={role} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit">Create</Button>
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
        value={table.getColumn("name")?.getFilterValue() ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
      />
      <Input
        placeholder="Search by email"
        value={table.getColumn("email")?.getFilterValue() ?? ""}
        onChange={(event) =>
          table.getColumn("email")?.setFilterValue(event.target.value)
        }
      />
      <DataTableViewOptions table={table} />
    </div>
  );
}
