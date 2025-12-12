/**
 * Simple message hooks for displaying messages (e.g. in authentication)
 */

import { useState } from "react";

export const MessageTypes = Object.freeze({
  NORMAL: "normal",
  SPECIAL: "special",
  ERROR: "error",
});

export const MessageTypeToColor = Object.freeze({
  [MessageTypes.NORMAL]: "text-foreground",   // normal text color
  [MessageTypes.SPECIAL]: "text-primary",     // primary color
  [MessageTypes.ERROR]: "text-destructive",   // error color
});

export function useMessage() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(MessageTypes.NORMAL);
  const [isShowMessage, setIsShowMessage] = useState(false);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setIsShowMessage(true);
  };

  const resetMessage = () => {
    setMessage("");
    setMessageType(MessageTypes.NORMAL);
    setIsShowMessage(false);
  }

  return {
    message,
    isShowMessage,
    messageType,
    showMessage,
    resetMessage,
  };
}