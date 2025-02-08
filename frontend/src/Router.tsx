import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { LlmConfig } from './pages/LlmConfig.page';
import { Agents } from './pages/Agents.page';
import { KnowledgeBase } from './pages/KnowledgeBase.page';
import { EditorPage } from './pages/Editor.page';

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
    path: '/Editor',
    element: <EditorPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
