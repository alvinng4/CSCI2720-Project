import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function CommentsList({ comments, className, onSubmit, location }) {
  const [isLeavingComment, setIsLeavingComment] = useState(false);
  const [userInput, setUserInput] = useState("");
  /* 
  if (!comments || comments.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      </div>
    );
  }
*/
  return (
    
    <div className={cn(className, "space-y-3 w-full")}>
      {
        isLeavingComment ? (
          <>
          <Textarea
            placeholder="Share your thoughts"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(userInput);
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
              <Button className="px-3 py-2 text-xs" type="submit">Submit</Button>
            </div>
          </form>
          </>
        ) :
        <Button 
          variant="outline"
          className="w-full px-3 py-2 text-sm border rounded-md bg-background cursor-text hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onClick={() => setIsLeavingComment(true)}
        >
          Leave a comment
        </Button>
      }
      {(!comments || comments.length === 0)&&(
        <div className={className}>
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        </div>
      )}
      {comments?.map((comment) => (
        <CommentBubble key={comment["_id"]} comment={comment} />
      ))}
    </div>
  )
}

function CommentBubble({ comment }) {
  const MAX_USERNAME_LEN = 20;

  const { user, content, timestamp } = comment;
  const username = user?.username;
  const initial = user?.username?.[0]?.toUpperCase() ?? "?";
  const displayUsername = (
    username && username.length > MAX_USERNAME_LEN
    ? username.slice(0, MAX_USERNAME_LEN) + "..."
    : username
  );

  const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : "";

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
        <div className="mt-1 rounded-lg bg-muted px-3 py-2 text-sm whitespace-pre-line">
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