// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

/**
 * Simple message hooks for displaying messages (e.g. in authentication)
 */

import { useCallback, useState } from "react";

export const MessageTypes = Object.freeze({
  NORMAL: "normal",
  SPECIAL: "special",
  ERROR: "error",
});

export const MessageTypeToColor = Object.freeze({
  [MessageTypes.NORMAL]: "text-foreground", // normal text color
  [MessageTypes.SPECIAL]: "text-primary", // primary color
  [MessageTypes.ERROR]: "text-destructive", // error color
});

export function useMessage() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(MessageTypes.NORMAL);
  const [isShowMessage, setIsShowMessage] = useState(false);

  const showMessage = useCallback((text, type = MessageTypes.NORMAL) => {
    setMessage(text);
    setMessageType(type);
    setIsShowMessage(true);
  }, []);

  const resetMessage = useCallback(() => {
    setMessage("");
    setMessageType(MessageTypes.NORMAL);
    setIsShowMessage(false);
  }, []);

  return {
    message,
    isShowMessage,
    messageType,
    showMessage,
    resetMessage,
  };
}
