import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlock from "@tiptap/extension-code-block";
import { JSONContent } from "@tiptap/core";

interface TemplateEditorProps {
  editorState: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
}

const TemplateEditor: React.FC<TemplateEditorProps> = (props) => {
  const { editorState, onChange, placeholder } = props;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Saisissez votre texte ici...",
      }),
      CodeBlock, // Ajoute la possibilité d'insérer des blocs de code
    ],
    content: editorState,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TemplateEditor;
