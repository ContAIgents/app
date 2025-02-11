import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';

import { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { AppProvider } from './AppContext';
import { Router } from './Router';
import { ConfigManager } from './services/config/ConfigManager';
import { theme } from './theme';

import '@mantine/notifications/styles.css';

export default function App() {
  useEffect(() => {
    const configManager = new ConfigManager();

    // Process any pending syncs on app start
    configManager.processPendingSync();

    // Optionally, set up periodic retry
    const intervalId = setInterval(
      () => {
        configManager.processPendingSync();
      },
      5 * 60 * 1000
    ); // Every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AppProvider>
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <Notifications position="top-right" />
          <Router />
        </ModalsProvider>
      </MantineProvider>
    </AppProvider>
  );
}
