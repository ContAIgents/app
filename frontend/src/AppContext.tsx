import React, { createContext, ReactNode, useCallback, useState } from 'react';
import EditorStateManager from './utils/EditorStateManager';
import { ContentBlock, Comment } from './types/content';

const links:ILink[] = [
  { label: 'Usage', link: '#usage', order: 1 },
  { label: 'Position and placement', link: '#position', order: 1 },
  { label: 'With other overlays', link: '#overlays', order: 1 },
  { label: 'Manage focus', link: '#focus', order: 1 },
  { label: 'Examples', link: '#1', order: 1 },
];

const editorStateManager = new EditorStateManager();

// Remove IContentBlock interface as we're now using ContentBlock from types/content

export interface AppState {
  // Define your state properties here
  editorConfig: {
    projectId: string;
    indexTree: ILink[];
    contentBlocks: ContentBlock[];
   
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
    indexTree: links,
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

interface ILink {
  label: string;
  link: string;
  order: number;
}


