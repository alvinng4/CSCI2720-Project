import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Input } from "@/components/ui/input";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import CommonTableToolBar from "@/components/common-table-toolbar";
import { getUser, isAdmin } from "@/lib/AuthHelpers";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PageShell } from "@/components/page-shell";
import { requestToBackend } from "@/lib/utils";
import UserManagerSideMenu from "./UserManagerSideMenu";

const UserTableContext = createContext(null);

export function UserManager() {
  const [showLoading, setShowLoading] = useState(true);
  const timeoutRef = useRef(null);
  const [isCreating, setIsCreating] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [users, setUsers] = useState([]);
  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();

  function startCreating() {
    setIsCreating(true);
  }

  function stopCreating() {
    setIsCreating(false);
  }

  function startLoading() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to show loading after 750ms
    timeoutRef.current = setTimeout(() => {
      setShowLoading(true);
    }, 300);
  }

  function stopLoading() {
    // Clear timeout if loading was stopped before 750ms
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setShowLoading(false);
  }

  const fetchUsers = useCallback(async () => {
    startLoading();
    let result = await requestToBackend("GET", "users");
    if (!result.ok || !result?.data) {
      const errMsg =
        "Error occurred when fetching user data: " +
        (result?.error || "Unknown error");
      showMessage(errMsg, MessageTypes.ERROR);
      stopLoading();
      return;
    }

    const mappedData = result.data.map((users) => ({
      id: users._id,
      name: users.username,
      email: users.email,
      role: users.role,
    }));
    setUsers(mappedData);
    setLastSyncTime(new Date());
    resetMessage();
    stopLoading();
  }, [showMessage, resetMessage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

    const mappedData = {
      username: userData.name,
      email: userData.email,
      role: userData.role,
      password: userData.password,
    };

    let result = await requestToBackend("POST", "users", mappedData);
    if (!result.ok || !result?.data) {
      const errMsg =
        "Error occurred when creating user: " +
        (result?.error || "Unknown error");
      showMessage(errMsg, MessageTypes.ERROR);
      return false;
    }

    showMessage(
      "New user created. Password: " + userData.password,
      MessageTypes.SPECIAL
    );
    fetchUsers();
    return true;
  }

  function startEditing(id) {
    const editingUser = users.find((user) => user.id === id);
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
    if (!id) {
      showMessage("Missing user id.", MessageTypes.ERROR);
      return;
    }

    const patch = {
      username: editingName,
      email: editingEmail,
      role: editingRole,
    };

    if (!patch.username?.trim()) {
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

    if (!patch) {
      showMessage("User data is invalid.", MessageTypes.ERROR);
      return;
    }

    let result = await requestToBackend("PUT", `users/${id}`, patch);
    if (!result.ok || !result?.data) {
      const errMsg =
        "Error occurred when updating user: " +
        (result?.error || "Unknown error");
      showMessage(errMsg, MessageTypes.ERROR);
      return;
    }

    stopEditing();
    showMessage(
      `User with id ${id} is successfully updated.`,
      MessageTypes.SPECIAL
    );
    fetchUsers();
  }

  async function handleDelete(id) {
    const currentUser = getUser();
    if (currentUser && currentUser.id === id) {
      showMessage("You cannot delete your own account.", MessageTypes.ERROR);
      return;
    }

    const userConsent = confirm("Delete this user?");
    if (!userConsent) {
      return;
    }

    let result = await requestToBackend("DELETE", `users/${id}`);
    if (!result.ok || !result?.data) {
      const errMsg =
        "Error occurred when deleting user: " +
        (result?.error || "Unknown error");
      showMessage(errMsg, MessageTypes.ERROR);
      return;
    }

    showMessage(
      `User with id ${id} is successfully deleted.`,
      MessageTypes.SPECIAL
    );
    fetchUsers();
  }

  /* Columns (created once only to prevent input issues) */
  const columns = useMemo(getColumns, []);

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
      {showLoading ? (
        <LoadingScreen />
      ) : (
        <>
          {/* Feedback message */}
          <p
            hidden={!isShowMessage}
            className={MessageTypeToColor[messageType]}
          >
            {message}
          </p>
          {isAdmin && (
            <UserTableContext.Provider value={contextValue}>
              <DataTable
                columns={columns}
                data={users}
                renderSideMenu={(table) =>
                  UserManagerSideMenu({ table: table, refresh: fetchUsers })
                }
                renderToolbar={() => (
                  <CommonTableToolBar
                    lastSyncTime={lastSyncTime}
                    admin={isAdmin}
                    caption={"Create User"}
                    onClick={startCreating}
                  />
                )}
              />
            </UserTableContext.Provider>
          )}
        </>
      )}
    </PageShell>
  );
}

function getColumns() {
  return [
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
  ];

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
}

/* Create user side menu */

// /* Create user side menu */
// function CreateUserSideMenu({ initial, onSubmit }) {
//   const [name, setName] = useState(initial?.name ?? "");
//   const [email, setEmail] = useState(initial?.email ?? "");
//   const [role, setRole] = useState(initial?.role ?? "user");

//   return (
//     <Card className="bg-transparent shadow-none gap-2 w-75">
//       <CardHeader>
//         <CardTitle>
//           <span>Create User</span>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="flex flex-col gap-3">
//         <form
//           onSubmit={async (e) => {
//             e.preventDefault();
//             const result = await onSubmit({ name, email, role });
//             if (result) {
//               setName("");
//               setEmail("");
//             }
//           }}
//           className="flex flex-col gap-3"
//         >
//           <Input
//             placeholder="Username"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//           <Input
//             placeholder="Email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <Select value={role} onValueChange={(value) => setRole(value)}>
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Role" value={role} />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="user">User</SelectItem>
//               <SelectItem value="admin">Admin</SelectItem>
//             </SelectContent>
//           </Select>

//           <Button type="submit">Create</Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }
