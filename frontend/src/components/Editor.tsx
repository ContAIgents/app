import React, { useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link, RichTextEditor } from '@mantine/tiptap';

// import Link from '@tiptap/extension-link';

interface RichTextEditorComponentProps {
  content: string;
  onUpdate: (content: string) => void;
  disabled?: boolean;
}

const RichTextEditorComponent: React.FC<RichTextEditorComponentProps> = ({ 
  content, 
  onUpdate,
  disabled = false 
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Link],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editable: !disabled
  });

  // Add this effect to update editor's editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  return (
    <RichTextEditor editor={editor} variant="subtle">
      {/* <RichTextEditor.Toolbar sticky stickyOffset={60}> */}
      <RichTextEditor.ControlsGroup>
        <RichTextEditor.Bold />
        <RichTextEditor.Italic />
        <RichTextEditor.Underline />
        <RichTextEditor.Strikethrough />
        <RichTextEditor.ClearFormatting />
        <RichTextEditor.Highlight />
        <RichTextEditor.Code />
      </RichTextEditor.ControlsGroup>
      {/* </RichTextEditor.Toolbar> */}
      <RichTextEditor.Content style={{ 
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? 'not-allowed' : 'text'
      }} />
    </RichTextEditor>
  );
};

export default RichTextEditorComponent;
