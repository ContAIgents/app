import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  radius: {
    default: 'sm',
  },
  colors: {
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
    AppShell: {
      styles: {
        main: {
          backgroundColor: 'var(--mantine-color-body)',
        },
      },
    },
    Paper: {
      defaultProps: {
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-default)',
        },
      },
    },
    Card: {
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-default)',
        },
      },
    },
    Modal: {
      styles: {
        body: {
          backgroundColor: 'var(--mantine-color-default)',
        },
      },
    },
  },
});