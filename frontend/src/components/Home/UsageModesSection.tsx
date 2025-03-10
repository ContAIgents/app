import { Box, SimpleGrid, Text, Title } from '@mantine/core';
import { IdeaToContentCard } from './UsageModes/IdeaToContentCard';
import { MarkdownIDECard } from './UsageModes/MarkdownIDECard';

export function UsageModesSection() {
  return (
    <Box py={80}>
      <Title order={2} size="h1" ta="center" mb="md">
        Two Powerful Ways to Create
      </Title>
      <Text c="dimmed" ta="center" mb={50} maw={600} mx="auto">
        Whether you're starting fresh or enhancing existing content, we've got you covered
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={40}>
        <IdeaToContentCard />
        <MarkdownIDECard />
      </SimpleGrid>
    </Box>
  );
}
