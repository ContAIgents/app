import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { AppProvider } from './AppContext';
import { Router } from './Router';
import { theme } from './theme';
import { useEffect } from 'react';
import { ConfigManager } from './services/config/ConfigManager';

export default function App() {
  useEffect(() => {
    const configManager = new ConfigManager();
    
    // Process any pending syncs on app start
    configManager.processPendingSync();

    // Optionally, set up periodic retry
    const intervalId = setInterval(() => {
      configManager.processPendingSync();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

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
