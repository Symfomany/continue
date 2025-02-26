import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockExtension from "@tiptap/extension-code-block";
import { JSONContent } from '@tiptap/core';
import StarterKit from "@tiptap/starter-kit";

interface TemplateEditorProps {
  editorState: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  editable?: boolean;
}

const TemplateEditor: React.FC<TemplateEditorProps> = (props) => {
  const { editorState, onChange, placeholder, editable = true } = props;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Placeholder.configure({
        placeholder: placeholder || "Saisissez votre texte ici...",
      }),
      CodeBlockExtension,
    ],
    editorProps: {
      attributes: {
        class: "outline-none -mt-1 overflow-hidden",
      },
    },
    content: editorState,
    editable: editable,
    onUpdate: ({ editor }) => {
      props.onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TemplateEditor;
