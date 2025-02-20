import { SymbolWithRange } from "core";
import { useContext, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { ToolTip } from "../gui/Tooltip";
import { isJetBrains } from "../../util";
import { useDispatch } from "react-redux";
import { createSession } from "../../redux/thunks/session";
import { AppDispatch } from "../../redux/store";

interface SymbolLinkProps {
  symbol: SymbolWithRange;
  content: string;
}

/**
 * Renders a clickable link that displays a symbol's content and, when clicked, navigates the IDE to the symbol's location.
 *
 * @param {SymbolLinkProps} props - The component's props.
 * @param {SymbolWithRange} props.symbol - The symbol to link to, containing its location and content.
 * @param {string} props.content - The display text for the link, typically shorter than the full symbol content.
 * @returns {JSX.Element} A span element containing the clickable link and a tooltip displaying the full symbol content.
 */
function SymbolLink({ symbol, content }: SymbolLinkProps) {
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useDispatch<AppDispatch>();

  function onClick() {
    ideMessenger.post("showLines", {
      filepath: symbol.filepath,
      startLine: symbol.range.start.line,
      endLine: symbol.range.end.line,
    });


     const sessionLite = {
        action: "showLines",
        filepath: symbol.filepath,
        startLine: symbol.range.start.line,
        endLine: symbol.range.end.line,
        ide: isJetBrains() ? "Intellij" : "VSCode",
      };
  
   try {
       dispatch(createSession({ sessionLite }));
      console.log("Session creation dispatched successfully.");
      // Optionally, do something after the session is dispatched.
    } catch (error) {
      console.error("Error dispatching createSession:", error);
      // Display an error message to the user (e.g., using a state variable and conditional rendering).
      // Or, attempt to retry the dispatch after a delay.
    }


  }

  const processedContent = useMemo(() => {
    let content = symbol.content;
    // TODO Normalize indentation
    // let lines = symbol.content.split("\n");
    // if (lines.length > 1) {
    //   const firstLineIndentation = lines[0].match(/^\s*/)?.[0].length || 0;
    //   content = lines
    //     .map((line) => line.slice(firstLineIndentation))
    //     .join("\n");
    // }

    // Truncate
    return content.length > 200 ? content.slice(0, 196) + "\n..." : content;
  }, [symbol]);

  const id = uuidv4();
  return (
    <>
      <span
        className="mx-[0.1em] mb-[0.15em] inline-flex cursor-pointer flex-row items-center gap-[0.2rem] rounded-md align-middle hover:ring-1"
        onClick={onClick}
        data-tooltip-id={id}
        data-tooltip-delay-show={500}
      >
        <code className="align-middle underline underline-offset-2">
          {content}
        </code>
      </span>
      <ToolTip id={id} place="top" className="m-0 p-0">
        <pre className="text-left">{processedContent ?? symbol.filepath}</pre>
      </ToolTip>
    </>
  );
}

export default SymbolLink;
