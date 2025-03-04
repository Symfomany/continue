import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ApplyState } from "core";
import { usePostHog } from "posthog-js/react";
import { useContext } from "react";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectIsSingleRangeEditOrInsertion } from "../../redux/slices/sessionSlice";
import { createSession } from "../../redux/thunks/session";
import { isJetBrains } from "../../util";
import { getFileInfo } from "../../util/detectLanguage";

export interface AcceptRejectAllButtonsProps {
  pendingApplyStates: ApplyState[];
  onAcceptOrReject?: (outcome: AcceptOrRejectOutcome) => void;
}

export type AcceptOrRejectOutcome = "acceptDiff" | "rejectDiff";



export default function AcceptRejectAllButtons({
  pendingApplyStates,
  onAcceptOrReject,
}: AcceptRejectAllButtonsProps) {
  const dispatch = useAppDispatch();
  const ideMessenger = useContext(IdeMessengerContext);
  const isSingleRangeEdit = useAppSelector(selectIsSingleRangeEditOrInsertion);
  const posthog = usePostHog();
  const history = useAppSelector((state) => state.session.history);
  const selectedModelTitle = useAppSelector(
    (store) => store.config.defaultModelTitle,
  );
  async function handleAcceptOrReject(status: AcceptOrRejectOutcome) {
    
    for (const { filepath = "", streamId } of pendingApplyStates) {
      ideMessenger.post(status, {
        filepath,
        streamId,
      });

      
      // Exemple d'utilisation :
      const fileInfo = getFileInfo(filepath);
      // Sortie: { filename: 'ContinueInputBox.tsx', language: 'TypeScript' }


      console.log("lines !!!! ", filepath, isSingleRangeEdit, selectIsSingleRangeEditOrInsertion,status );
      
        let sessionLite = {
              action: "rejectAll",
              filepath,
              fileInfo,
              history,
              text: status,
              model: selectedModelTitle,
              

              ide: isJetBrains() ? "Intellij" : "VSCode",
            };
      if(status == "acceptDiff"){
        sessionLite.action = "acceptAll";
      } else {
        sessionLite.action = "rejectAll";
      }
   

  
      dispatch(createSession({ sessionLite }))

      posthog.capture(sessionLite.action, sessionLite);

    }

    if (onAcceptOrReject) {
      onAcceptOrReject(status);
    }
  }

  return (
    <div className="flex justify-center gap-2 border-b border-gray-200/25 p-1 px-3">
      <button
        className="flex cursor-pointer items-center border-none bg-transparent px-2 py-1 text-xs text-gray-300 opacity-80 hover:opacity-100 hover:brightness-125"
        onClick={() => handleAcceptOrReject("rejectDiff")}
        data-testid="edit-reject-button"
      >
        <XMarkIcon className="mr-1 h-4 w-4 text-red-600" />
        {isSingleRangeEdit ? (
          <span>Rejeter</span>
        ) : (
          <>
            <span className="sm:hidden">Reject</span>
            <span className="max-sm:hidden md:hidden">Reject all</span>
            <span className="max-md:hidden">Reject all changes</span>
          </>
        )}
      </button>
      <button
        className="flex cursor-pointer items-center border-none bg-transparent px-2 py-1 text-xs text-gray-300 opacity-80 hover:opacity-100 hover:brightness-125"
        onClick={() => handleAcceptOrReject("acceptDiff")}
        data-testid="edit-accept-button"
      >
        <CheckIcon className="mr-1 h-4 w-4 text-green-600" />
        {isSingleRangeEdit ? (
          <span>Accepter</span>
        ) : (
          <>
            <span className="sm:hidden">Accept</span>
            <span className="max-sm:hidden md:hidden">Accept all</span>
            <span className="max-md:hidden">Accept all changes</span>
          </>
        )}
      </button>
    </div>
  );
}
