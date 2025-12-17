import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

import { requestToBackend } from "@/lib/utils";
import useAsync from "@/hooks/use-async";
import {
  useMessage,
  MessageTypes,
  MessageTypeToColor,
} from "@/hooks/use-message";

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}

export default function CreateUserSheet({ isCreating, stopCreating, refresh }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();
  const { isLoading, startBackgroundLoading, stopBackgroundLoading } =
    useAsync();

  async function createUser(userData) {
    resetMessage();

    if (!userData.username?.trim()) {
      showMessage("Name is required", MessageTypes.ERROR);
      return;
    }
    if (!userData.email?.trim()) {
      showMessage("Email is required", MessageTypes.ERROR);
      return;
    }
    if (!userData.role?.trim()) {
      showMessage("Role is required", MessageTypes.ERROR);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+$/;
    if (!emailPattern.test(userData.email)) {
      showMessage("Please enter a valid email address", MessageTypes.ERROR);
      return;
    }

    if (isLoading) {
      showMessage(
        "Processing. Please wait before submitting!",
        MessageTypes.ERROR
      );
      return;
    }

    startBackgroundLoading();
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 25; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    userData.password = password;

    showMessage("Connecting to database...");
    let result = await requestToBackend("POST", "users", userData);
    stopBackgroundLoading();

    if (!result.ok || !result?.data) {
      const errMsg =
        "Error occurred when creating user: " +
        (result?.error || "Unknown error");
      showMessage(errMsg, MessageTypes.ERROR);
      return;
    }

    showMessage(
      "New user created. Password: " + userData.password,
      MessageTypes.SPECIAL
    );
    setUsername("");
    setEmail("");
    refresh();
    return;
  }

  return (
    <Sheet open={isCreating} onOpenChange={stopCreating}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await createUser({ username, email, role });
          }}
          className="flex flex-col gap-3"
        >
          <SheetHeader className="px-4">
            <SheetTitle>Create User (Admin)</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            {/* Feedback message */}
            <p
              hidden={!isShowMessage}
              className={MessageTypeToColor[messageType]}
            >
              {message}
            </p>

            {/* Details */}
            <div>
              {makeSubsectionTitle("Details")}
              <div className="space-y-2">
                <Input
                  placeholder="Username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button type="submit">Create user</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
