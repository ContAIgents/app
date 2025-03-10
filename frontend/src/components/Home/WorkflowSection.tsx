import { Box, Tabs, Text, Title, Image, Group } from '@mantine/core';
import { useEffect, useState } from 'react';
import classes from '../../pages/Home.module.css';

const WORKFLOW_STEPS = [
  {
    number: '01',
    title: 'Onboard AI Team',
    description:
      'Configure AI providers like OpenAI, Anthropic, Google, locally running models on ollama and more.\n\n Onboard your first AI content writer and reviewer by defining their expertise, writing styles, and skills',
    demo: '/screenshots/onboard-team.png',
  },
  {
    number: '02',
    title: 'Define Your Vision',
    description:
      'Specify your content idea and target audience with detailed requirements.\n\nOur AI workforce understands your goals and adapts to your specific needs and brand voice.',
    demo: '/screenshots/define-vision.png',
  },
  {
    number: '03',
    title: 'Structure & Generate',
    description:
      'Get AI-powered content structure suggestions and generate high-quality content.\n\nIterate and refine with intelligent feedback from specialized review agents.',
    demo: '/screenshots/generate-content.png',
  },
  {
    number: '04',
    title: 'Export & Transform',
    description:
      'Export your content in multiple formats - from text to audio, visuals, or mixed media.\n\nPerfect for cross-platform content strategy and multichannel distribution. \n\n Imagine you wrote a blog and have a ready to publish podcast!',
    demo: '/screenshots/export-transform.png',
  },
];

export function WorkflowSection() {
  const [activeTab, setActiveTab] = useState('01');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setActiveTab(current => {
        const currentIndex = WORKFLOW_STEPS.findIndex(step => step.number === current);
        const nextIndex = (currentIndex + 1) % WORKFLOW_STEPS.length;
        return WORKFLOW_STEPS[nextIndex].number;
      });
    }, 5000); // Switch every 5 seconds

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <Box mt={120} mb={80} py={40} className={classes.stepsSection}>
      <Title order={1} size="h1" ta="center">
        How it Works?
      </Title>
      <Text c="dimmed" ta="center" mt="sm" mb={50}>
        Transform your ideas into compelling content with our AI-powered platform
      </Text>

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value || '01')}
        orientation="vertical"
        className={classes.workflowTabs}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Tabs.List className={classes.workflowTabsList}>
          {WORKFLOW_STEPS.map((step) => (
            <Tabs.Tab
              key={step.number}
              value={step.number}
              className={classes.workflowTab}
            >
              <Box className={classes.tabContent}>
                <Group align="center" gap="xs">
                  <Text size="sm" c="dimmed">Step {step.number}</Text>
                  <Text fw={500}>{step.title}</Text>
                </Group>
                <Box className={classes.descriptionWrapper}>
                  <Text 
                    size="sm" 
                    c="dimmed" 
                    className={classes.description}
                    style={{ 
                      display: activeTab === step.number ? 'block' : 'none',
                    }}
                  >
                    {step.description}
                  </Text>
                </Box>
              </Box>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {WORKFLOW_STEPS.map((step) => (
          <Tabs.Panel key={step.number} value={step.number}>
            <Box className={classes.workflowDemo}>
              <Image
                src={step.demo}
                alt={step.title}
                radius="md"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Box>
  );
}
