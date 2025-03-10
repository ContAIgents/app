import React, { useEffect, useRef, useState } from 'react';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import { Markdown } from 'tiptap-markdown';
import { RichTextEditor } from '@mantine/tiptap';
import { ContentImportMenu } from './ContentImportMenu/ContentImportMenu';
import { SelectionMenu } from './Editor/SelectionMenu';
import { Agent } from '@/services/agents/Agent';
import { notifications } from '@mantine/notifications';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import { Loader, Text } from '@mantine/core';

interface MarkdownEditorComponentProps {
  content: string;
  onUpdate: (content: string) => void;
  disabled?: boolean;
  disableAIFeatures?: boolean;
}

const lowlight = createLowlight(common);

const MarkdownEditorComponent: React.FC<MarkdownEditorComponentProps> = ({
  content,
  onUpdate,
  disabled = false,
  disableAIFeatures = false,
}) => {
  const { selectedAgent, isLoading, error } = useSelectedAgent({
    fallbackRole: 'content_writer'
  });

  const [selection, setSelection] = useState('');
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      // Convert to Markdown before sending update
      const markdown = editor.storage.markdown.getMarkdown();
      onUpdate(markdown);
    },
    editable: !disabled,
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  useEffect(() => {
    if (editor && content) {
      // Only update if the content is different
      const currentMarkdown = editor.storage.markdown.getMarkdown();
      if (currentMarkdown !== content) {
        editor.commands.setContent(content, false);
      }
    }
  }, [editor, content]);

  const handleSelectionChange = () => {
    if (editor?.view.state.selection.empty) {
      setShowMenu(false);
      return;
    }

    const text = editor?.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
    );

    if (text && text.length > 0) {
      if (!editor) return;
      
      // Get the selection coordinates
      const { from, to } = editor.state.selection;
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const editorElement = editor.view.dom.getBoundingClientRect();
      
      // Calculate position relative to the editor
      // Position the menu at the end of the selection
      setMenuPosition({ 
        x: end.left - editorElement.left,
        y: end.top - editorElement.top, // Remove the offset to place it right next to text
      });
      setSelection(text);
      setShowMenu(true);
    }
  };

  useEffect(() => {
    if (editor) {
      editor.on('selectionUpdate', handleSelectionChange);
    }
  }, [editor]);

  const handleRephrase = async (text: string, instructions: string) => {
    if (!selectedAgent) {
      notifications.show({
        title: 'Error',
        message: 'No agent selected',
        color: 'red',
      });
      return;
    }

    try {
      const response = await selectedAgent.executeTextTask(text, 'rephrase', instructions);
      
      editor?.chain()
        .focus()
        .setTextSelection({
          from: editor.state.selection.from,
          to: editor.state.selection.to,
        })
        .insertContent(response)
        .focus()
        .run();

      notifications.show({
        title: 'Text Rephrased',
        message: 'The selected text has been rephrased',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to rephrase text',
        color: 'red',
      });
    }
  };

  const handleGrammarCheck = async (text: string) => {
    if (!selectedAgent) {
      notifications.show({
        title: 'Error',
        message: 'No agent selected',
        color: 'red',
      });
      return;
    }

    try {
      const response = await selectedAgent.executeTextTask(text, 'grammar');
      
      editor?.chain()
        .focus()
        .setTextSelection({
          from: editor.state.selection.from,
          to: editor.state.selection.to,
        })
        .insertContent(response)
        .focus()
        .run();

      notifications.show({
        title: 'Grammar Checked',
        message: 'The text has been checked and corrected',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to check grammar',
        color: 'red',
      });
    }
  };

  const handleExplain = async (text: string) => {
    if (!selectedAgent) {
      notifications.show({
        title: 'Error',
        message: 'No agent selected',
        color: 'red',
      });
      return;
    }

    try {
      const response = await selectedAgent.executeTextTask(text, 'explain');
      
      editor?.chain()
        .focus()
        .setTextSelection({
          from: editor.state.selection.from,
          to: editor.state.selection.to,
        })
        .insertContent(response)
        .focus()
        .run();

      notifications.show({
        title: 'Text Simplified',
        message: 'The text has been rewritten for better understanding',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to simplify text',
        color: 'red',
      });
    }
  };

  if (isLoading) {
    return <Loader size="sm" />;
  }

  if (error) {
    return <Text c="red">{error}</Text>;
  }

  return (
    <div style={{ position: 'relative' }}>
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

          {!disableAIFeatures && <ContentImportMenu />}
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
      
      {!disableAIFeatures && showMenu && (
        <SelectionMenu
          selection={selection}
          position={menuPosition}
          onRephrase={handleRephrase}
          onGrammarCheck={handleGrammarCheck}
          onExplain={handleExplain}
          isLoading={isLoading}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default MarkdownEditorComponent;
