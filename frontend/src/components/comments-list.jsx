import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getToken, getUser } from "@/lib/AuthHelpers";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ?? "http://localhost:4000") + "/api";

export function CommentsList({ className, location, setCommentLength }) {
  const [isLeavingComment, setIsLeavingComment] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();

  /* Load comments */
  useEffect(() => {
    (async () => {
      resetMessage();
      setIsLoading(true);
      setCommentLength(0);
      let res = null;
      try {
        res = await fetch(
          `${API_BASE}/comments/?location=${encodeURIComponent(location?.id ?? "")}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
      } catch {
        showMessage(
          "Failed to fetch comment data from database.",
          MessageTypes.ERROR
        );
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        // Get error message
        let uiMessage = "Unknown error. Please try again later.";
        try {
          const data = await res.json();
          if (data?.error) {
            uiMessage = data.error;
          }
        } catch {
          // Do nothing
        }

        showMessage(uiMessage, MessageTypes.ERROR);
        setIsLoading(false);
        return;
      }

      resetMessage();
      const comments = await res.json();
      setComments(comments);
      setCommentLength(comments?.length ?? 0);
      setIsLoading(false);
    })();
  }, [location]);

  /* Submit comment */
  const submitComment = async (content) => {
    resetMessage();
    let res = null;
    const user = getUser();
    try {
      res = await fetch(`${API_BASE}/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          content,
          user: user.id,
          location: location.id,
        }),
      });
    } catch {
      showMessage("Failed to submit comment to database.", MessageTypes.ERROR);
      setIsLoading(false);
      return;
    }

    if (!res.ok) {
      // Get error message
      let uiMessage = "Unknown error. Please try again later.";
      try {
        const data = await res.json();
        if (data?.error) {
          uiMessage = data.error;
        }
      } catch {
        // Do nothing
      }

      showMessage(uiMessage, MessageTypes.ERROR);
      setIsLoading(false);
      return;
    }

    resetMessage();
    const newComment = await res.json();
    setComments((comments) => [newComment, ...comments]);
    setCommentLength((s) => s + 1);
    setIsLoading(false);
  };

  return (
    <div className={cn(className, "space-y-3 w-full")}>
      {/* Feedback message */}
      <p
        hidden={!isShowMessage}
        className={cn("text-center", MessageTypeToColor[messageType])}
      >
        {message}
      </p>
      {isLeavingComment ? (
        <>
          <Textarea
            placeholder="Share your thoughts"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitComment(userInput);
              setUserInput("");
              setIsLeavingComment(false);
            }}
          >
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="px-3 py-2 text-xs bg-transparent"
                onClick={() => setIsLeavingComment(false)}
              >
                Cancel
              </Button>
              <Button className="px-3 py-2 text-xs" type="submit">
                Submit
              </Button>
            </div>
          </form>
        </>
      ) : (
        <Button
          variant="outline"
          className="w-full px-3 py-2 text-sm border rounded-md bg-background cursor-text hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onClick={() => setIsLeavingComment(true)}
        >
          Leave a comment
        </Button>
      )}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          {(!comments || comments.length === 0) && (
            <div>
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            </div>
          )}
          {comments?.map((comment) => (
            <CommentBubble key={comment["_id"]} comment={comment} />
          ))}
        </>
      )}
    </div>
  );
}

function CommentBubble({ comment }) {
  const MAX_USERNAME_LEN = 20;

  const { user, content, createdAt } = comment;
  const username = user?.username;
  const initial = user?.username?.[0]?.toUpperCase() ?? "?";
  const displayUsername =
    username && username.length > MAX_USERNAME_LEN
      ? username.slice(0, MAX_USERNAME_LEN) + "..."
      : username;

  const formattedTime = createdAt ? new Date(createdAt).toLocaleString() : "";

  return (
    <div className="flex gap-3">
      {/* User Icon */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
        {initial}
      </div>

      <div className="flex-1">
        {/* Username */}
        <span className="text-sm font-medium">{displayUsername}</span>

        {/* Actual content */}
        <div className="mt-1 rounded-lg bg-secondary px-3 py-2 text-sm whitespace-pre-line">
          {content}
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <span className="text-[11px] text-muted-foreground">
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
}
