import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { JSONContent } from '@tiptap/core';
import StarterKit from "@tiptap/starter-kit";
import styled from "styled-components";
import { all, createLowlight } from 'lowlight'
const lowlight = createLowlight(all)

import 'highlight.js/styles/github-dark.css';
import CodeBlockExtension from "@tiptap/extension-code-block";

import {
  CodeBracketSquareIcon,
  ItalicIcon,
  BoldIcon,
} from "@heroicons/react/24/outline";

interface TemplateEditorProps {
  editorState: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  editable?: boolean;
}

const StyledButton = styled.button`
  background-color: #222;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 2px;
  margin: 3px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;

  &:hover {
    background-color: #111;
  }

  &:active {
    background-color: #d0d0d0;
  }

  &.is-active {
    background-color: #ddd;
  }
`;
const StyledToolbarContainer = styled.div`
  display: flex;
  justify-content: flex-end;
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
            <BoldIcon className="h-4 w-4" />
          </StyledButton>
          <StyledButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            <ItalicIcon className="h-4 w-4" />
          </StyledButton>
          <StyledButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'is-active' : ''}
          >
            <CodeBracketSquareIcon className="h-4 w-4" />
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
      CodeBlockLowlight.configure({
        lowlight,
      }),
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
      <StyledEditorContent editor={editor} />
      <StyledToolbarContainer>
        <Toolbar editor={editor} />
      </StyledToolbarContainer>
    </div>
  );
};

export default TemplateEditor;
