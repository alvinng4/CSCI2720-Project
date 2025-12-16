import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Input } from "@/components/ui/input";
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
  useState,
} from "react";

import CommonTableToolBar from "@/components/common-table-toolbar";
import CreateUserSheet from "./CreateUserSheet";
import { getUser, isAdmin } from "@/lib/AuthHelpers";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import { PageShell } from "@/components/page-shell";
import { requestToBackend } from "@/lib/utils";
import useAsync from "@/hooks/use-async";
import UserManagerSideMenu from "./UserManagerSideMenu";

const UserTableContext = createContext(null);

export function UserManager() {
  const [users, setUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();
  const { showLoading, lastSyncTime, startLoading, stopLoading } = useAsync();

  function startCreating() {
    setIsCreating(true);
  }

  function stopCreating() {
    setIsCreating(false);
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
    const mappedData = result.data.map((user) => ({
      ...user,
      id: user._id,
    }));
    setUsers(mappedData);
    stopLoading();
  }, [showMessage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [editingEmail, setEditingEmail] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  /* Handlers */
  function startEditing(id) {
    const editingUser = users.find((user) => user.id === id);
    if (editingUser) {
      setEditingId(id);
      setEditingName(editingUser.username);
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

    const originalUserData = users.find((user) => user?.id === id);
    if (!originalUserData) {
      showMessage("Error: Original user data not found", MessageTypes.ERROR);
      return;
    }

    // Check if the new data is same as old data
    const oldUsername = originalUserData?.username;
    const oldEmail = originalUserData?.email;
    const oldRole = originalUserData?.role;

    if (
      oldUsername === patch.username &&
      oldEmail === patch.email &&
      oldRole === patch.role
    ) {
      stopEditing();
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

  const refresh = () => {
    fetchUsers();
    resetMessage();
  };

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
    <>
      <CreateUserSheet
        isCreating={isCreating}
        stopCreating={stopCreating}
        refresh={refresh}
      />
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
                    UserManagerSideMenu({ table: table, refresh: refresh })
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
    </>
  );
}

function getColumns() {
  return [
    {
      accessorKey: "username",
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
    return row.original.username;
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
