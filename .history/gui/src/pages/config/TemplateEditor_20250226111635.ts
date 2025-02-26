import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/core";
import { Paragraph } from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockExtension from "@tiptap/extension-code-block";
import { History } from "@tiptap/extension-history"; // Ajout de l'import pour History
import Image from "@tiptap/extension-image"; // Ajout de l'import pour Image

// Définir le type JSONContent (si ce n'est pas déjà défini)
import { JSONContent } from '@tiptap/core';

// Définir le type pour les props
interface TemplateEditorProps {
  editorState: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
}

const TemplateEditor: React.FC<TemplateEditorProps> = (props) => {
  const { editorState, onChange, placeholder } = props;

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: placeholder || "Saisissez votre texte ici...",
      }),
      CodeBlockExtension,
      History,
      Image.extend({
        addProseMirrorPlugins() {
          return []; // Suppression du code lié à l'upload d'images
        },
      }).configure({
        HTMLAttributes: {
          class: "object-contain max-h-[210px] max-w-full mx-1",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "outline-none -mt-1 overflow-hidden",
      },
    },
    content: editorState,
  });

  useEffect(() => {
    if (editor) {
      editor.on('update', ({ editor }) => {
        props.onChange(editor.getJSON());
      });
    }
  }, [editor, props]);


  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TemplateEditor;
