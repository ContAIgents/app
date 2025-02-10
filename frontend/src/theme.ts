import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'sm',
  colors: {
    // You can customize dark mode colors here if needed
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
  components: {

    // Define background levels through components
    AppShell: {
      styles: (theme) => ({
        main: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }),
    },
    Paper: {
      defaultProps: {
        withBorder: true,
      },
      styles: (theme) => ({
        root: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        },
      }),
    },
    Card: {
      styles: (theme) => ({
        root: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
        },
      }),
    },
    Modal: {
      styles: (theme) => ({
        body: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        },
      }),
    },
  },
  // Custom CSS variables for different background levels
  variables: {
    // Level 1: Main app background (deepest)
    '--mantine-bg-level-1': 'var(--mantine-color-dark-9)',
    '--mantine-bg-level-1-light': 'var(--mantine-color-gray-0)',
    
    // Level 2: Container background
    '--mantine-bg-level-2': 'var(--mantine-color-dark-8)',
    '--mantine-bg-level-2-light': 'var(--mantine-color-gray-1)',
    
    // Level 3: Card/Paper background
    '--mantine-bg-level-3': 'var(--mantine-color-dark-7)',
    '--mantine-bg-level-3-light': 'var(--mantine-color-white)',
    
    // Level 4: Elevated components (modals, popovers)
    '--mantine-bg-level-4': 'var(--mantine-color-dark-6)',
    '--mantine-bg-level-4-light': 'var(--mantine-color-white)',
  },
  // Default body background
  body: {
    backgroundColor: 'var(--mantine-bg-level-1)',
  },
});
