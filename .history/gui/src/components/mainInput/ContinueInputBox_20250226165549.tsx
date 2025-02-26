import { Editor, JSONContent } from "@tiptap/react";
import { ContextItemWithId, InputModifiers } from "core";
import { useDispatch } from "react-redux";
import styled, { keyframes } from "styled-components";
import { defaultBorderRadius, vscBackground } from "..";
import { selectSlashCommandComboBoxInputs } from "../../redux/selectors";
import ContextItemsPeek from "./ContextItemsPeek";
import TipTapEditor from "./TipTapEditor";
import { useAppSelector } from "../../redux/hooks";
import { ToolbarOptions } from "./InputToolbar";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { MessageTemplate } from "../../redux/slices/configSlice"; // Import du type MessageTemplate

interface ContinueInputBoxProps {
  isEditMode?: boolean;
  isLastUserInput: boolean;
  isMainInput?: boolean;
  onEnter: (
    editorState: JSONContent,
    modifiers: InputModifiers,
    editor: Editor,
  ) => void;
  editorState?: JSONContent;
  contextItems?: ContextItemWithId[];
  hidden?: boolean;
  inputId: string; // used to keep track of things per input in redux
}

const EDIT_DISALLOWED_CONTEXT_PROVIDERS = [
  "codebase",
  "tree",
  "open",
  "web",
  "diff",
  "folder",
  "search",
  "debugger",
  "repo-map",
];


const gradient = keyframes`
  0% {
    background-position: 0px 0;
  }
  100% {
    background-position: 100em 0;
  }
`;


const StyledSelect = styled.select`
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.8em;
  border: 1px solid #ccc;
  background-color: #444;
  font-size: 1rem;
  color: #fff;
  appearance: none; /* Remove default arrow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); /* Custom arrow */
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em;
  padding-right: 2.5rem;
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const GradientBorder = styled.div<{
  borderRadius?: string;
  borderColor?: string;
  loading: 0 | 1;
}>`
  border-radius: ${(props) => props.borderRadius || "0"};
  padding: 1px;
  background: ${(props) =>
    props.borderColor
      ? props.borderColor
      : `repeating-linear-gradient(
      101.79deg,
      #1BBE84 0%,
      #331BBE 16%,
      #BE1B55 33%,
      #A6BE1B 55%,
      #BE1B55 67%,
      #331BBE 85%,
      #1BBE84 99%
    )`};
  animation: ${(props) => (props.loading ? gradient : "")} 6s linear infinite;
  background-size: 200% 200%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

function ContinueInputBox(props: ContinueInputBoxProps) {
  const isStreaming = useAppSelector((state) => state.session.isStreaming);
  const availableSlashCommands = useAppSelector(
    selectSlashCommandComboBoxInputs,
  );
  const availableContextProviders = useAppSelector(
    (state) => state.config.config.contextProviders,
  );
  const editModeState = useAppSelector((state) => state.editModeState);

  const filteredSlashCommands = props.isEditMode ? [] : availableSlashCommands;
  const filteredContextProviders = useMemo(() => {
    if (!props.isEditMode) {
      return availableContextProviders ?? [];
    }

    return (
      availableContextProviders?.filter(
        (provider) =>
          !EDIT_DISALLOWED_CONTEXT_PROVIDERS.includes(provider.title),
      ) ?? []
    );
  }, [availableContextProviders]);

  const historyKey = props.isEditMode ? "edit" : "chat";
  const placeholder = props.isEditMode
    ? "Décris ton code - utilise '#' pour ajouter des fichiers"
    : undefined;

  const toolbarOptions: ToolbarOptions = props.isEditMode
    ? {
        hideAddContext: false,
        hideImageUpload: false,
        hideUseCodebase: true,
        hideSelectModel: false,
        enterText: editModeState.editStatus === "accepting" ? "Retry" : "Edit",
      }
    : {};


    const messageTemplates = useAppSelector((state) => state.config.messageTemplates); // Récupère les templates depuis Redux
    const [selectedTemplate, setSelectedTemplate] = useState < MessageTemplate | null > (null); // State pour le template sélectionné

    const [editorState, setEditorState] = useState(createTipTapDocument(""));

    
    function createTipTapDocument(content: JSONContent | string | null): JSONContent {
    console.log("content", content, typeof content);
    if(content === null) {
      return {
        type: 'doc',
        content: [ {
          type: 'paragraph',
          content: [ {
            type: 'text',
            text: "Aucun template sélectionné.",
          }],
        }],
      };
    }
    if (typeof content === 'string') {
        // Check for empty string
        if (content === "") {
            console.warn("Le contenu est une chaîne vide. Retour par défaut.");
            return {
                type: 'doc',
                content: [{
                    type: 'paragraph',
                    content: [{
                        type: 'text',
                        text: "Aucun template sélectionné.",
                    }],
                }],
            };
        }
        // Try parsing if it's a string
        try {
            const parsedContent = JSON.parse(content);
            if (typeof parsedContent === 'object' && parsedContent !== null && parsedContent.type === 'doc') {
                return parsedContent as JSONContent;  // Valid JSON
            } else {
                // Handle if parsing fails
                console.error("Le parsing JSON a échoué ou n'est pas de type 'doc'.");
                return {
                    type: 'doc',
                    content: [{
                        type: 'paragraph',
                        content: [{
                            type: 'text',
                            text: "Erreur lors du chargement du template.",
                        }],
                    }],
                };
            }
        } catch (error) {
            // Handle if parsing fails
            console.error("Le parsing JSON a échoué:", error);
            return {
                type: 'doc',
                content: [{
                    type: 'paragraph',
                    content: [{
                        type: 'text',
                        text: "Erreur lors du chargement du template.",
                    }],
                }],
            };
        }
    } else if (typeof content === 'object' && content !== null && content.type === 'doc') {
      console.log("Type DOC content", content);
      
        return content as JSONContent; // Already JSON
    } else {
        console.error("Le contenu est nul ou non valide.");
        return {
            type: 'doc',
            content: [{
                type: 'paragraph',
                content: [{
                    type: 'text',
                    text: "Aucun template selectionné.",
                }],
            }],
        }
    }
}

    useEffect(() => {
      if (selectedTemplate && selectedTemplate.content) {
        try {
          const parsedContent = JSON.parse(selectedTemplate.content);
          console.log("parsedContent", parsedContent);
          
          setEditorState(createTipTapDocument(parsedContent)); // Utiliser createTipTapDocument ici
        } catch (error) {
          console.error("Erreur de parsing JSON:", error);
          setEditorState(createTipTapDocument("Error loading template"));
        }
      }
    }, [selectedTemplate]);
    // Callback pour mettre à jour le contenu de l'éditeur TipTap lors de la sélection d'un template
  

    
 const handleTemplateSelect = useCallback(
      (event: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = event.target.value;
        const selected = messageTemplates.find(t => t.id === templateId) || null;

        setSelectedTemplate(selected);
      },
      [messageTemplates],
    );



  return (
    <div className={`${props.hidden ? "hidden" : ""}`}>
            <div className={`relative flex flex-col px-2`}>
                <GradientBorder
                    loading={isStreaming && props.isLastUserInput ? 1 : 0}
                    borderColor={
                        isStreaming && props.isLastUserInput ? undefined : vscBackground
                    }
                    borderRadius={defaultBorderRadius}
                >
                    <TipTapEditor
                        onEnter={props.onEnter}
                        placeholder={placeholder}
                        isMainInput={props.isMainInput ?? false}
                        availableContextProviders={filteredContextProviders}
                        availableSlashCommands={filteredSlashCommands}
                        historyKey={historyKey}
                        toolbarOptions={toolbarOptions}
                        inputId={props.inputId}
                        editorState={editorState}
                    />
                </GradientBorder>
            </div>


             {messageTemplates.length ? <div className={`relative flex flex-col px-2`}>
              <StyledSelect value={selectedTemplate ? selectedTemplate.id : ""} onChange={handleTemplateSelect}>
                    <option value="">Sélectionner un template</option>
                    {messageTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                            {template.title}
                        </option>
                    ))}
                </StyledSelect>
            </div> : <></>}

            <ContextItemsPeek
                contextItems={props.contextItems}
                isCurrentContextPeek={props.isLastUserInput}
            />
        </div>
  );
}

export default ContinueInputBox;
