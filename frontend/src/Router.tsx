import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';

// Lazy load all pages
const HomePage = lazy(() => import('./pages/Home.page'));
const Agents = lazy(() => import('./pages/Agents.page').then(module => ({ default: module.Agents })));
const EditorPage = lazy(() => import('./pages/Editor.page').then(module => ({ default: module.EditorPage })));
const EditorIdea = lazy(() => import('./pages/EditorIdea.page').then(module => ({ default: module.EditorIdea })));
const FileEditorPage = lazy(() => import('./pages/FileEditor.page').then(module => ({ default: module.FileEditorPage })));
const GetStarted = lazy(() => import('./pages/GetStarted.page').then(module => ({ default: module.GetStarted })));
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase.page').then(module => ({ default: module.KnowledgeBase })));
const KnowledgeBaseEdit = lazy(() => import('./pages/KnowledgeBaseEdit.page').then(module => ({ default: module.KnowledgeBaseEdit })));
const LlmConfig = lazy(() => import('./pages/LlmConfig.page').then(module => ({ default: module.LlmConfig })));
const ResetPage = lazy(() => import('./pages/Reset.page').then(module => ({ default: module.ResetPage })));
const ExportPage = lazy(() => import('./pages/Export.page').then(module => ({ default: module.ExportPage })));
const DocsPage = lazy(() => import('./pages/Docs.page').then(module => ({ default: module.DocsPage })));

// Loading component
const LoadingFallback = () => (
  <Center h="100vh">
    <Loader size="xl" variant="dots" />
  </Center>
);

// Wrap component with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(HomePage),
  },
  {
    path: '/getStarted',
    element: withSuspense(GetStarted),
  },
  {
    path: '/files',
    element: withSuspense(FileEditorPage),
  },
  {
    path: '/llmConfig',
    element: withSuspense(LlmConfig),
  },
  {
    path: '/agents',
    element: withSuspense(Agents),
  },
  {
    path: '/knowledgeBase',
    element: withSuspense(KnowledgeBase),
  },
  {
    path: '/knowledgeBase/edit/default',
    element: withSuspense(KnowledgeBaseEdit),
  },
  {
    path: '/editor/idea',
    element: withSuspense(EditorIdea),
  },
  {
    path: '/editor',
    element: withSuspense(EditorPage),
  },
  {
    path: '/editor/files',
    element: withSuspense(FileEditorPage),
  },
  {
    path: '/export',
    element: withSuspense(ExportPage),
  },
  {
    path: '/reset',
    element: withSuspense(ResetPage),
  },
  {
    path: '/docs/*',
    element: withSuspense(DocsPage),
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
