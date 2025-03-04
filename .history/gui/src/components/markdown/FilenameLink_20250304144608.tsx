import { RangeInFile } from "core";
import { findUriInDirs, getUriPathBasename } from "core/util/uri";
import { usePostHog } from "posthog-js/react";
import { useContext } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../../context/Auth"; // Import du hook useAuth
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { AppDispatch } from "../../redux/store";
import { createSession } from "../../redux/thunks/session";
import { isJetBrains } from "../../util";
import { getFileInfo } from "../../util/detectLanguage";
import FileIcon from "../FileIcon";
import { ToolTip } from "../gui/Tooltip";

interface FilenameLinkProps {
  rif: RangeInFile;
}

function FilenameLink({ rif }: FilenameLinkProps) {
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useDispatch<AppDispatch>();
  const {session} = useAuth();
  const posthog = usePostHog();
  
  function onClick() {
    ideMessenger.post("showLines", {
      filepath: rif.filepath,
      startLine: rif.range.start.line,
      endLine: rif.range.end.line,
    });

    const fileInfo = getFileInfo(rif.filepath);
    
    const sessionLite = {
        action: "showLines",
        fileInfo,
        filepath: rif.filepath,
        startLine: rif.range.start.line,
        endLine: rif.range.end.line,
        ide: isJetBrains() ? "Intellij" : "VSCode",
    };
      
      dispatch(createSession({ sessionLite }));

       posthog.capture("showLines", sessionLite);
  }

  const id = uuidv4();

  let relPathOrBasename = "";
  try {
    const { relativePathOrBasename } = findUriInDirs(
      rif.filepath,
      window.workspacePaths ?? [],
    );
    relPathOrBasename = relativePathOrBasename;
  } catch (e) {
    return <span>{getUriPathBasename(rif.filepath)}</span>;
  }

  return (
    <>
      <span
        data-tooltip-id={id}
        data-tooltip-delay-show={500}
        className="mx-[0.1em] mb-[0.15em] inline-flex cursor-pointer items-center gap-0.5 rounded-md pr-[0.2em] align-middle hover:ring-1"
        onClick={onClick}
      >
        <FileIcon filename={rif.filepath} height="20px" width="20px" />
        <span className="mb-0.5 align-baseline underline underline-offset-2">
          {getUriPathBasename(rif.filepath)}
        </span>
      </span>
      <ToolTip id={id} place="top">
        {"/" + relPathOrBasename}
      </ToolTip>
    </>
  );
}

export default FilenameLink;
