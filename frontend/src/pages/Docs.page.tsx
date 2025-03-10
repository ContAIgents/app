import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Title, Paper } from '@mantine/core';

type MdxModule = {
  default: React.ComponentType;
};

// Import all MDX files
const mdxModules = import.meta.glob('../docs/**/*.mdx');

export function DocsPage() {
  const [Content, setContent] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const loadContent = async () => {
      try {
        // Get the path after /docs/
        const path = location.pathname.replace('/docs/', '') || 'index';
        const modulePath = `../docs/${path}.mdx`;
        
        if (mdxModules[modulePath]) {
          const module = await mdxModules[modulePath]();
          setContent(() => (module as MdxModule).default);
        } else {
          setContent(() => () => <Title order={1}>Page not found</Title>);
        }
      } catch (error) {
        console.error('Error loading documentation:', error);
        setContent(() => () => <Title order={1}>Error loading page</Title>);
      }
    };

    loadContent();
  }, [location]);

  return (
    <Container size="md" py="xl">
      <Paper p="md" radius="md">
        {Content && <Content />}
      </Paper>
    </Container>
  );
}

export default { DocsPage };
