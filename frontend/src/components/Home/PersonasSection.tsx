import {
  IconBook,
  IconBrandTwitter,
  IconBroadcast,
  IconCode,
  IconPencil,
  IconPresentation,
} from '@tabler/icons-react';
import { Box, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import classes from './PersonaSection.module.css';
import { useEffect, useRef, useState } from 'react';

const PERSONAS = [
  {
    icon: IconPresentation,
    title: 'Marketing Managers',
    description:
      'Create compelling marketing content, blog posts, and campaign materials with AI assistance tailored to your brand voice.',
    examples: [
      'Brand storytelling',
      'Marketing campaigns',
      'Product launches',
      'Email newsletters',
    ],
  },
  {
    icon: IconCode,
    title: 'Developer Relations',
    description:
      'Generate technical documentation, tutorials, and developer-focused content that bridges the gap between technical and marketing.',
    examples: ['API documentation', 'Code tutorials', 'Technical blogs', 'Developer guides'],
  },
  {
    icon: IconBook,
    title: 'Technical Writers',
    description:
      'Streamline documentation workflows and maintain consistency across technical content with AI-powered assistance.',
    examples: ['User manuals', 'Product documentation', 'Release notes', 'Knowledge bases'],
  },
  {
    icon: IconBroadcast,
    title: 'Content Strategists',
    description:
      'Plan and create content strategies with AI insights, ensuring consistent messaging across all channels.',
    examples: ['Content calendars', 'SEO optimization', 'Content audits', 'Analytics reports'],
  },
  {
    icon: IconBrandTwitter,
    title: 'Social Media Influencers',
    description:
      'Transform your ideas into engaging social media content, threads, and stories optimized for different platforms.',
    examples: [
      'Twitter threads',
      'LinkedIn articles',
      'Podcasts',
      'Social media reels',
    ],
  },
  {
    icon: IconPencil,
    title: 'Technical Bloggers',
    description:
      'Create in-depth technical articles and tutorials with accurate code examples and explanations.',
    examples: ['Technical tutorials', 'Code walkthroughs', 'Best practices', 'Technology reviews'],
  },
];

export function PersonasSection() {
  const [activePersonaIndex, setActivePersonaIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (isHovering) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setActivePersonaIndex((prev) => (prev + 1) % PERSONAS.length);
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering]);

  return (
    <Box py={80}>
      <Title order={2} size="h1" ta="center" mb="md">
        Who is it for?
      </Title>
      <Text c="dimmed" ta="center" mb={50} maw={600} mx="auto">
        Tailored solutions for different content creators
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={40}>
        {PERSONAS.map((persona, index) => (
          <Box 
            key={index} 
            className={classes.personaBox}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Group align="flex-start" mb="md">
              <ThemeIcon
                size={40}
                radius="md"
                variant="light"
                color="blue"
                className={classes.personaIcon}
              >
                <persona.icon size={24} />
              </ThemeIcon>
              <Stack gap={4}>
                <Text fw={700} size="lg">
                  {persona.title}
                </Text>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                  {persona.description}
                </Text>
              </Stack>
            </Group>

            <Box className={classes.tagsContainer}>
              <Group gap={8} wrap="wrap">
                {persona.examples.map((example, i) => (
                  <Text 
                    key={i} 
                    size="sm" 
                    className={`${classes.personaTag} ${!isHovering && index === activePersonaIndex ? classes.activeTag : ''}`}
                  >
                    {example}
                  </Text>
                ))}
              </Group>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
