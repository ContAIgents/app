import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { AppProvider } from './AppContext';
import { Router } from './Router';
import { theme } from './theme';

export default function App() {
  return (
    <AppProvider>
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <Router />
        </ModalsProvider>
      </MantineProvider>
    </AppProvider>
  );
}
