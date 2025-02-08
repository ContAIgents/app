import React, { createContext, ReactNode, useCallback, useState } from 'react';
import { TreeNodeData } from '@mantine/core';
import EditorStateManager from './utils/EditorStateManager';

const editorStateManager = new EditorStateManager();

interface IComment {
  timestamp: string;
  user: string;
  comment: string;
  id: number;
}

export interface IContentBlock {
  id: number;
  content: string;
  comments: IComment[];
}

export interface AppState {
  // Define your state properties here
  editorConfig: {
    projectId: string;
    indexTree: TreeNodeData[];
    contentBlocks: IContentBlock[];
   
  };
}

export interface AppContextProps {
  editorState: AppState;
  setEditorState: React.Dispatch<React.SetStateAction<AppState>>;
  updateEditorState: (id: number, content: string) => void;
  dumpToFile?: () => void;
}

const defaultState: AppState = {
  editorConfig: {
    projectId: '123',
    indexTree: [
      {
        label: 'Introduction',
        value: 'Introduction',
        children: [
          {
            label: 'Concept',
            value: 'src/components',
            children: [
              { label: 'Accordion.tsx', value: 'src/components/Accordion.tsx' },
              { label: 'Tree.tsx', value: 'src/components/Tree.tsx' },
              { label: 'Button.tsx', value: 'src/components/Button.tsx' },
            ],
          },
        ],
      },
    ],
    contentBlocks: editorStateManager.getEditors(),
  },
};

export const AppCtx = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [editorState, setEditorState] = useState<AppState>(defaultState);
  const updateEditorState = (id:number, content:string) => {
    editorStateManager.updateEditor(id, content);
  };
  const dumpToFile = useCallback(() => {
    const data = JSON.stringify(editorStateManager.getEditors());
    console.log(data);
  },[])

  return <AppCtx.Provider value={{ editorState, setEditorState, updateEditorState, dumpToFile }}>{children}</AppCtx.Provider>;
};
