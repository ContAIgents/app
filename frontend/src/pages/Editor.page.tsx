import React, { useContext } from 'react';
import { Container, Group, Paper, Stack, } from '@mantine/core';
import { AppContextProps, AppCtx } from '@/AppContext';
import RichTextEditorComponent from '../components/Editor';
import { TableOfContents } from '@/components/TableOfContents';



export const EditorPage: React.FC = () => {
  const appCtx = useContext(AppCtx);
  const { editorState, updateEditorState, dumpToFile } = appCtx as unknown as AppContextProps;

  const handleUpdate = (id: number, content: string) => {
    updateEditorState(id, content);
  };

  const handleAddEditor = () => {
    // editorStateManager.addEditor();
    // setEditors([...editorStateManager.getEditors()]);
  };

  const handleSelect = (node: any) => {
    console.log('Selected node:', node);
  };

  const { editorConfig } = editorState;
  // console.log(editorConfig);
  return (
    <Container size="xl" py="xl" style={{ height: 'calc(100vh - 80px)' }}>
      <Stack h="100%" spacing="md" style={{ flexDirection: 'row' }}>
        <Paper p="md">
          {/* Tree view component goes here */}
          {/* <TableOfContents/> */}
        </Paper>
        <Stack h="100%" spacing="md" style={{ flex: 2 }}>
          {editorConfig?.contentBlocks.map((editor) => (
            <Group>
              <Paper key={editor.id} p="md" style={{ flex: 1 }}>
                <RichTextEditorComponent
                  content={editor.content}
                  onUpdate={(content) => handleUpdate(editor.id, content)}
                />
              </Paper>
              <Stack spacing="md">
                {editor?.comments?.map(({user, comment, id}) => (
                  <Paper key={id} p="md">
                    <div>
                      <strong>{user}</strong>
                      <p>{comment}</p>
                    </div>
                  </Paper>
                ))}
              </Stack>
            </Group>
          ))}
          {/* <button type="button" onClick={dumpToFile}>
            Export
          </button> */}
        </Stack>
      </Stack>
    </Container>
  );
};
``;
