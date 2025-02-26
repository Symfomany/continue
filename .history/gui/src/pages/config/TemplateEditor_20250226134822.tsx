import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockExtension from "@tiptap/extension-code-block";
import { JSONContent } from '@tiptap/core';
import StarterKit from "@tiptap/starter-kit";
import styled from "styled-components";

interface TemplateEditorProps {
  editorState: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  editable?: boolean;
}

const StyledButton = styled.button`
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 8px 12px;
  margin: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background-color: #e0e0e0;
  }

  &:active {
    background-color: #d0d0d0;
  }

  &.is-active {
    background-color: #ddd;
  }
`;

const StyledEditorContent = styled(EditorContent)`
  border: 1px solid #ccc;
  font: inherit;
  border-radius: 5px;
  padding-left: 15px;
  padding-top: 5px;
  overflow: auto;
  min-height: 150px;
  &:focus {
    box-shadow: 5px 5px white; 
  }
`;

// Créer un composant Toolbar
const Toolbar = (props: { editor: any }) => {
  const { editor } = props;

  if (!editor) {
    return null;
  }

  return (
    <div>
     <StyledButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        Gras
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        Italique
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'is-active' : ''}
      >
        Code Block
      </StyledButton>
    </div>
  );
};

const TemplateEditor: React.FC<TemplateEditorProps> = (props) => {
  const { editorState, onChange, placeholder, editable = true } = props;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      CodeBlockExtension,
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
       <Toolbar editor={editor} />
      <StyledEditorContent editor={editor} />
    </div>
  );
};

export default TemplateEditor;
