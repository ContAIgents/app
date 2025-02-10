import React, { createContext, ReactNode, useCallback, useState } from 'react';
import EditorStateManager from './utils/EditorStateManager';


const links:ILink[] = [
  { label: 'Usage', link: '#usage', order: 1 },
  { label: 'Position and placement', link: '#position', order: 1 },
  { label: 'With other overlays', link: '#overlays', order: 1 },
  { label: 'Manage focus', link: '#focus', order: 1 },
  { label: 'Examples', link: '#1', order: 1 },
  // { label: 'Show on focus', link: '#2', order: 2 },
  // { label: 'Show on hover', link: '#3', order: 2 },
  // { label: 'With form', link: '#4', order: 2 },
];

const editorStateManager = new EditorStateManager();

interface IComment {
  timestamp: string;
  user: string;
  comment: string;
  id: number;
  status: 'idle' | 'loading' | 'error' | 'success';
}

export interface IContentBlock {
  id: number;
  title: string;
  content: string;
  description: string;
  comments: IComment[];
}

export interface AppState {
  // Define your state properties here
  editorConfig: {
    projectId: string;
    indexTree: ILink[];
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


