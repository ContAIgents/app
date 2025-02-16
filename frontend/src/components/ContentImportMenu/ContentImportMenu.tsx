import {
  IconBrain,
  IconChartBar,
  IconChartTreemap,
  IconFileImport,
  IconLock,
  IconMathFunction,
  IconNetwork,
  IconPhoto,
  IconTable,
  IconTimeline,
} from '@tabler/icons-react';
import { ActionIcon, Button, Menu, Text, Tooltip } from '@mantine/core';

export const ContentImportMenu = () => {
  const menuItems = [
    {
      icon: IconPhoto,
      label: 'Generate Image from Text',
      description: 'Convert your text descriptions into AI-generated images',
    },
    {
      icon: IconChartBar,
      label: 'Generate Chart from Data',
      description: 'Create beautiful charts and graphs from your data',
    },
    {
      icon: IconBrain,
      label: 'Visualize Concepts',
      description: 'Transform abstract concepts into visual diagrams',
    },
    {
      icon: IconMathFunction,
      label: 'Format Equations',
      description: 'Convert text equations into beautiful mathematical notation',
    },
    {
      icon: IconChartTreemap,
      label: 'Create Mind Maps',
      description: 'Generate interactive mind maps from your content',
    },
    {
      icon: IconTable,
      label: 'Format Tables',
      description: 'Convert text data into formatted tables and matrices',
    },
    {
      icon: IconNetwork,
      label: 'Generate Flowcharts',
      description: 'Create flowcharts from process descriptions',
    },
    {
      icon: IconTimeline,
      label: 'Create Timeline',
      description: 'Visualize chronological data as interactive timelines',
    },
  ];

  return (
    <Menu width={300}>
      <Menu.Target>
        <ActionIcon variant="light" size="md">
          <IconFileImport size="1.1rem" />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Insert Special Content</Menu.Label>
        {menuItems.map((item) => (
          <Tooltip key={item.label} label="Coming Soon!" position="right" withArrow>
            <Menu.Item leftSection={<item.icon size="1.1rem" />} disabled>
              <Text size="sm">{item.label}</Text>
              <Text size="xs" c="dimmed">
                {item.description}
              </Text>
            </Menu.Item>
          </Tooltip>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
