import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';
import { AppProvider } from './AppContext';

export default function App() {
  return (
    <AppProvider>
      <MantineProvider theme={theme}>
        <Router />
      </MantineProvider>
    </AppProvider>
  );
}