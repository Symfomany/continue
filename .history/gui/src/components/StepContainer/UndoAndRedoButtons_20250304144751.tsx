import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";
import { usePostHog } from "posthog-js/react";
import { useContext } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../context/Auth"; // Import du hook useAuth
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useAppSelector } from "../../redux/hooks";
import { setCurCheckpointIndex } from "../../redux/slices/sessionSlice";
import { AppDispatch } from "../../redux/store";
import { createSession } from "../../redux/thunks/session";
import { isJetBrains } from "../../util";
import { getFileInfo } from "../../util/detectLanguage";

export default function UndoAndRedoButtons() {
const dispatch = useDispatch<AppDispatch>();
 const {session} = useAuth();
  const ideMessenger = useContext(IdeMessengerContext);
  const posthog = usePostHog();
  const history = useAppSelector((store) => store.session.history);

  const curCheckpointIndex = useAppSelector(
    (store) => store.session.curCheckpointIndex,
  );

  const shouldRenderRedo = false; // curCheckpointIndex !== checkpoints.length - 1;

  async function handleUndoOrRedo(type: "undo" | "redo") {
    const checkpointIndex = Math.max(
      0,
      type === "undo" ? curCheckpointIndex - 1 : curCheckpointIndex + 1,
    );

    const checkpoint = history[checkpointIndex]?.checkpoint ?? {};

    for (const [filepath, cachedFileContent] of Object.entries(checkpoint)) {
      ideMessenger.post("overwriteFile", {
        filepath,
        prevFileContent: cachedFileContent,
      });

      const fileInfo = getFileInfo(filepath);
      
      const sessionLite = {
            action: "overwriteFile",
            type,
            filepath,
            fileInfo,
            prevFileContent: cachedFileContent,
            ide: isJetBrains() ? "Intellij" : "VSCode",
          };
      
      dispatch(createSession({ sessionLite }))
      posthog.capture("overwriteFile", sessionLite);
    }

    dispatch(setCurCheckpointIndex(checkpointIndex));
  }

  return (
    <div className="flex justify-center gap-2 border-b border-gray-200/25 p-1 px-3">
      <button
        className="flex cursor-pointer items-center border-none bg-transparent px-2 py-1 text-xs text-gray-300 opacity-80 hover:opacity-100 hover:brightness-125"
        onClick={() => handleUndoOrRedo("undo")}
      >
        <ArrowUturnLeftIcon className="mr-2 h-3.5 w-3.5" />
        Undo changes
      </button>

      {shouldRenderRedo && (
        <button
          className="flex cursor-pointer items-center border-none bg-transparent px-2 py-1 text-xs text-gray-300 opacity-80 hover:opacity-100 hover:brightness-125"
          onClick={() => handleUndoOrRedo("redo")}
        >
          <ArrowUturnRightIcon className="mr-2 h-3.5 w-3.5" />
          Redo changes
        </button>
      )}
    </div>
  );
}
