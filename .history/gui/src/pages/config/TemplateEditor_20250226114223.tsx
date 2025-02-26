// TemplateEditor.tsx
import React, { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockExtension from "@tiptap/extension-code-block";
// Importez Text depuis '@tiptap/core' et renommez-le pour éviter les conflits
import { JSONContent } from '@tiptap/core';
import { Text as TipTapText } from '@tiptap/core';


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
            TipTapText, // Utilisez TipTapText ici
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
        onUpdate: ({ editor }) => {
            props.onChange(editor.getJSON());
        },
    });

    return (
        <div>
            <EditorContent editor={editor} />
        </div>
    );
};

export default TemplateEditor;
