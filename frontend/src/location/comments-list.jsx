import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useState } from "react";

import { getUser } from "@/lib/AuthHelpers";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import { requestToBackend } from "@/lib/utils";
import useAsync from "@/hooks/use-async";

export default function CommentsList({
  className,
  location,
  setCommentLength,
}) {
  const [isLeavingComment, setIsLeavingComment] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [comments, setComments] = useState([]);
  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();
  const {
    isLoading,
    isForegroundLoading,
    startForegroundLoading,
    stopForegroundLoading,
  } = useAsync({ initialForegroundLoading: true });

  /* Load comments */
  const fetchComments = useCallback(async () => {
    if (!location?.id) {
      showMessage("Error: Missing location id!", MessageTypes.ERROR);
      return;
    }

    startForegroundLoading();
    const result = await requestToBackend(
      "GET",
      `comments/?location=${encodeURIComponent(location.id)}`
    );
    stopForegroundLoading();

    if (!result?.ok || !result?.data || !result?.data?.length) {
      showMessage(
        "Error when fetching comments: " +
          (result?.error || "Something went wrong."),
        MessageTypes.ERROR
      );
      return;
    }

    setComments(result.data);
    setCommentLength(result.data.length);
  }, [
    location,
    setCommentLength,
    startForegroundLoading,
    stopForegroundLoading,
    showMessage,
  ]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /* Submit comment */
  const submitComment = async (content) => {
    resetMessage();
    const user = getUser();

    if (isLoading) {
      showMessage("Processing. Please wait and try again later.", MessageTypes.ERROR);
      return;
    }

    startForegroundLoading();
    const result = await requestToBackend("POST", "comments/", {
      content,
      user: user.id,
      location: location.id,
    });
    stopForegroundLoading();

    if (!result?.ok || !result?.data) {
      showMessage(
        "Error when submitting comments: " +
          (result?.error || "Something went wrong."),
        MessageTypes.ERROR
      );
      return;
    }

    setComments((comments) => [result?.data, ...comments]);
    setCommentLength((s) => s + 1);
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
      {isForegroundLoading ? (
        <div>
          <p className="text-sm">Connecting to server...</p>
        </div>
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
