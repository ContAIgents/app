import { IconBrain, IconRobot, IconWand, IconWriting } from '@tabler/icons-react';
import { Box, Card, SimpleGrid, Text, Title } from '@mantine/core';
import classes from '../../pages/Home.module.css';

const FEATURES = [
  {
    icon: <IconBrain size={30} />,
    title: 'AI-Powered Writing',
    description:
      'Leverage advanced AI models to generate high-quality content tailored to your needs',
  },
  {
    icon: <IconRobot size={30} />,
    title: 'Custom AI Agents',
    description: 'Create specialized AI agents with different expertise and writing styles',
  },
  {
    icon: <IconWand size={30} />,
    title: 'Smart Formatting',
    description:
      'Automatically format and structure your content for different platforms and audiences',
  },
  {
    icon: <IconWriting size={30} />,
    title: 'Content Enhancement',
    description:
      'Polish your content with AI-powered grammar checking, rephrasing, and improvements',
  },
];

export function FeaturesSection() {
  return (
    <Box mt={80} mb={50}>
      <Title order={2} size="h2" ta="center" mb="xl">
        Supercharge Your Content Creation
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
        {FEATURES.map((feature, index) => (
          <Card key={index} padding="xl" radius="md" withBorder className={classes.featureCard}>
            <Card.Section p="md">
              <Box ta="center" c="blue">
                {feature.icon}
              </Box>
            </Card.Section>
            <Text fw={700} size="lg" ta="center" mt="md">
              {feature.title}
            </Text>
            <Text size="sm" c="dimmed" ta="center" mt="sm">
              {feature.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}
