import { useState, useContext, useCallback } from "react";
import { IdeMessengerContext } from "../context/IdeMessenger";
import { isJetBrains } from "../util";
import { useAppDispatch } from "../redux/hooks";
import { createSession } from "../redux/thunks/session";

export default function useCopy(text: string | (() => string)) {
  const [copied, setCopied] = useState<boolean>(false);
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useAppDispatch();
  

  const copyText = useCallback(() => {
    const textVal = typeof text === "string" ? text : text();
    if (isJetBrains()) {
      ideMessenger.post("copyText", { text: textVal });

        const sessionLite = {
          action: "copyText",
          text: textVal,
          history: textVal,
          ide: isJetBrains() ? "Intellij" : "VSCode",
        };
    
        dispatch(createSession({ sessionLite }))
    } else {
      navigator.clipboard.writeText(textVal);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text, ideMessenger]);

  return { copied, copyText };
}
