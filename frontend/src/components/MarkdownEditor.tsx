import React, { useEffect, useRef } from 'react';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import { Markdown } from 'tiptap-markdown';
import { RichTextEditor } from '@mantine/tiptap';
import { ContentImportMenu } from './ContentImportMenu/ContentImportMenu';

interface MarkdownEditorComponentProps {
  content: string;
  onUpdate: (content: string) => void;
  disabled?: boolean;
}

const lowlight = createLowlight(common);

const MarkdownEditorComponent: React.FC<MarkdownEditorComponentProps> = ({
  content,
  onUpdate,
  disabled = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Markdown,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      onUpdate(markdown);
    },
    editable: !disabled,
  });

  // Update content when editor is ready or content changes
  useEffect(() => {
    if (editor && content) {
      // Only update if the content is different to avoid unnecessary rerenders
      if (editor.storage.markdown.getMarkdown() !== content) {
        editor.commands.setContent(content, false);
      }
    }
  }, [editor, content]);

  // Update editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  if (!editor) {
    return null;
  }

  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar sticky stickyOffset={0}>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Code />
          <RichTextEditor.CodeBlock />
        </RichTextEditor.ControlsGroup>

        {/* <RichTextEditor.ControlsGroup>
          <RichTextEditor.Unlink />
          <RichTextEditor.Link />
          <RichTextEditor.Image />
        </RichTextEditor.ControlsGroup> */}
          <ContentImportMenu />
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  );
};

export default MarkdownEditorComponent;
