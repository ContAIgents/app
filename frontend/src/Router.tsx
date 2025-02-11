import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Agents } from './pages/Agents.page';
import { EditorPage } from './pages/Editor.page';
import { EditorIdea } from './pages/EditorIdea.page';
import { HomePage } from './pages/Home.page';
import { KnowledgeBase } from './pages/KnowledgeBase.page';
import { KnowledgeBaseEdit } from './pages/KnowledgeBaseEdit.page';
import { LlmConfig } from './pages/LlmConfig.page';
import { ResetPage } from './pages/Reset.page';
import { ExportPage } from './pages/Export.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/llmConfig',
    element: <LlmConfig />,
  },
  {
    path: '/agents',
    element: <Agents />,
  },
  {
    path: '/knowledgeBase',
    element: <KnowledgeBase />,
  },
  {
    path: '/knowledgeBase/edit/default',
    element: <KnowledgeBaseEdit />,
  },
  {
    path: '/editor/idea',
    element: <EditorIdea />,
  },
  {
    path: '/editor',
    element: <EditorPage />,
  },
  {
    path: '/export',
    element: <ExportPage />,
  },
  {
    path: '/reset',
    element: <ResetPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
