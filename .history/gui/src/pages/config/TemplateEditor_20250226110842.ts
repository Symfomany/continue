import React, { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { Plugin } from "prosemirror-state";
import { Text, EditorOptions } from "@tiptap/core";
import { Document } from "@tiptap/extension-document";
import { History } from "@tiptap/extension-history";
import Image from "@tiptap/extension-image";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import SlashCommand from "@tiptap/extension-slash-command";
import CodeBlockExtension from "@tiptap/extension-code-block"; // Assurez-vous d'importer correctement l'extension CodeBlock
import { defaultModelRef } from "./use-llm"; // Importez les références nécessaires
import { getPlaceholderText } from "./utils"; // Importez getPlaceholderText
import {
  addCodeToEdit,
  createSession,
  exitEditMode,
  loadLastSession,
} from "./store/slices/globalSlice"; // Importez les actions Redux nécessaires
import {
  availableContextProvidersRef,
  getSubmenuContextItemsRef,
  inDropdownRef,
  isInEditModeRef,
  isStreamingRef,
  nextRef,
  onEnterRef,
  prevRef,
  useActiveFile,
} from "./use-llm"; // Importez les références nécessaires
import { getContextProviderDropdownOptions } from "./components/context-provider-dropdown"; // Importez getContextProviderDropdownOptions
import { getSlashCommandDropdownOptions } from "./components/slash-command-dropdown"; // Importez getSlashCommandDropdownOptions
import { getFileInfo, isJetBrains } from "./utils"; // Importez les fonctions utilitaires nécessaires
import {
  handleImageFile,
  modelSupportsImages,
} from "./utils/image-upload"; // Importez les fonctions de gestion des images nécessaires
import { getFontSize } from "./components/font-size-dropdown"; // Importez getFontSize
import { posthog } from "posthog-js"; // Importez posthog
import { useAppDispatch, useAppSelector } from "./store/hooks"; // Importez les hooks Redux nécessaires
import { MockExtension } from "./extensions/mock-extension"; // Importez MockExtension
import AddCodeToEdit from "./extensions/add-code-to-edit";

// Définir le type JSONContent (si ce n'est pas déjà défini)
import { JSONContent } from '@tiptap/core';

// Définir le type pour les props
interface TemplateEditorProps {
  editorState: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  availableSlashCommands: any[];
  onEnter: (options: any) => void;
  availableContextProviders: any[];
  ideMessenger: any;
  isStreaming?: boolean;
  isMainInput?: boolean;
  className?: string; // Ajout d'une prop pour la classe CSS
}

const TemplateEditor: React.FC<TemplateEditorProps> = (props) => {
  const {
    editorState,
    onChange,
    placeholder,
    availableSlashCommands,
    onEnter,
    availableContextProviders,
    ideMessenger,
    isStreaming,
    isMainInput,
    className,
  } = props;

  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.global.session);

  const editor = useEditor({
    extensions: [
      Document,
      History,
      Image.extend({
        addProseMirrorPlugins() {
          const plugin = new Plugin({
            props: {
              handleDOMEvents: {
                paste(view, event) {
                  const model = defaultModelRef.current;
                  if (!model) return;
                  const items = event.clipboardData?.items;
                  if (items) {
                    for (const item of items) {
                      const file = item.getAsFile();
                      file &&
                        modelSupportsImages(
                          model.provider,
                          model.model,
                          model.title,
                          model.capabilities,
                        ) &&
                        handleImageFile(file).then((resp) => {
                          if (!resp) return;
                          const [img, dataUrl] = resp;
                          const { schema } = view.state;
                          const node = schema.nodes.image.create({
                            src: dataUrl,
                          });
                          const tr = view.state.tr.insert(0, node);
                          view.dispatch(tr);
                        });
                    }
                  }
                },
              },
            },
          });
          return [plugin];
        },
      }).configure({
        HTMLAttributes: {
          class: "object-contain max-h-[210px] max-w-full mx-1",
        },
      }),
      Placeholder.configure({
        placeholder: getPlaceholderText(
          props.placeholder,
          historyLengthRef.current,
        ),
      }),
      Paragraph.extend({
        addKeyboardShortcuts() {
          return {
            Enter: () => {
              if (inDropdownRef.current) {
                return false;
              }

              onEnterRef.current({
                useCodebase: false,
                noContext: !useActiveFile,
              });
              return true;
            },

            "Mod-Enter": () => {
              onEnterRef.current({
                useCodebase: true,
                noContext: !useActiveFile,
              });
              return true;
            },
            "Alt-Enter": () => {
              posthog.capture("gui_use_active_file_enter");

              onEnterRef.current({
                useCodebase: false,
                noContext: !!useActiveFile,
              });

              return true;
            },
            "Mod-Backspace": () => {
              // If you press cmd+backspace wanting to cancel,
              // but are inside of a text box, it shouldn't
              // delete the text
              if (isStreamingRef.current) {
                return true;
              }
              return false;
            },
            "Shift-Enter": () =>
              this.editor.commands.first(({ commands }) => [
                () => commands.newlineInCode(),
                () => commands.createParagraphNear(),
                () => commands.liftEmptyBlock(),
                () => commands.splitBlock(),
              ]),

            ArrowUp: () => {
              if (this.editor.state.selection.anchor > 1) {
                return false;
              }

              const previousInput = prevRef.current(
                this.editor.state.toJSON().doc,
              );
              if (previousInput) {
                this.editor.commands.setContent(previousInput);
                setTimeout(() => {
                  this.editor.commands.blur();
                  this.editor.commands.focus("start");
                }, 0);
                return true;
              }
              return false;
            },
            Escape: () => {
              if (inDropdownRef.current || !isInEditModeRef.current) {
                return false;
              }
              (async () => {
                await dispatch(
                  loadLastSession({
                    saveCurrentSession: false,
                  }),
                );
                dispatch(exitEditMode());
              })();

              return true;
            },
            ArrowDown: () => {
              if (
                this.editor.state.selection.anchor <
                this.editor.state.doc.content.size - 1
              ) {
                return false;
              }
              const nextInput = nextRef.current();
              if (nextInput) {
                this.editor.commands.setContent(nextInput);
                setTimeout(() => {
                  this.editor.commands.blur();
                  this.editor.commands.focus("end");
                }, 0);
                return true;
              }
              return false;
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class: "my-1",
        },
      }),
      Text,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: getContextProviderDropdownOptions(
          availableContextProvidersRef,
          getSubmenuContextItemsRef,
          enterSubmenu,
          onClose,
          onOpen,
          inSubmenuRef,
          ideMessenger,
        ),
        renderHTML: (props) => {
          return `@${props.node.attrs.label || props.node.attrs.id}`;
        },
      }),
      AddCodeToEdit.configure({
        HTMLAttributes: {
          class: "add-code-to-edit",
        },
        suggestion: {
          ...getContextProviderDropdownOptions(
            availableContextProvidersRef,
            getSubmenuContextItemsRef,
            enterSubmenu,
            onClose,
            onOpen,
            inSubmenuRef,
            ideMessenger,
          ),
          allow: () => isInEditModeRef.current,
          command: async ({ editor, range, props }) => {
            editor.chain().focus().insertContentAt(range, "").run();
            const filepath = props.id;
            const contents = await ideMessenger.ide.readFile(filepath);
            const fileInfo = getFileInfo(filepath);

            let sessionLite = {
              action: "addCodeToEdit",
              filepath,
              text: contents,
              fileInfo,
              ide: isJetBrains() ? "Intellij" : "VSCode",
              session: session ? session.account : null,
            };
            posthog.capture("addCodeToEdit", sessionLite);
            dispatch(createSession({ sessionLite }));
            dispatch(
              addCodeToEdit({
                filepath,
                contents,
              }),
            );
          },
          items: async ({ query }) => {
            // Only display files in the dropdown
            const results = getSubmenuContextItemsRef.current("file", query);
            return results.map((result) => ({
              ...result,
              label: result.title,
              type: "file",
              query: result.id,
              icon: result.icon,
            }));
          },
        },
      }),
      props.availableSlashCommands.length
        ? SlashCommand.configure({
            HTMLAttributes: {
              class: "mention",
            },
            suggestion: getSlashCommandDropdownOptions(
              availableSlashCommandsRef,
              onClose,
              onOpen,
              ideMessenger,
            ),
            renderText: (props) => {
              return props.node.attrs.label;
            },
          })
        : MockExtension,
      CodeBlockExtension,
    ],
    editorProps: {
      attributes: {
        class: "outline-none -mt-1 overflow-hidden",
        style: `font-size: ${getFontSize()}px;`,
      },
    },
    content: props.editorState,
    editable: !isStreaming || props.isMainInput,
  });

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TemplateEditor;
