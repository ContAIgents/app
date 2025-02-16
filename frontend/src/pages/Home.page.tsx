import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Text,
  Group,
  Chip,
  rem,
} from '@mantine/core';
import { CONTENT_TYPES, CONTENT_CATEGORIES } from '../constants/ideahub';

export function HomePage() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredTypes = CONTENT_TYPES.filter(
    type => selectedCategories.length === 0 || 
    (type.categories?.some(cat => selectedCategories.includes(cat)) ?? false)
  );

  const handleContentTypeSelect = (contentType: string) => {
    navigate(`/editor/idea?type=${contentType}`);
  };

  return (
    <Container size="xl" py="xl">
      <Title
        order={1}
        size="3rem"
        fw={900}
        ta="center"
        mb="xl"
      >
        What do you want to create?
      </Title>

      <Group justify="center" mb="xl">
        <Chip.Group
          multiple
          value={selectedCategories}
          onChange={setSelectedCategories}
        >
          {CONTENT_CATEGORIES.map((category) => (
            <Chip
              key={category.value}
              value={category.value}
              variant="filled"
              radius="xl"
            >
              {category.label}
            </Chip>
          ))}
        </Chip.Group>
      </Group>

      <SimpleGrid cols={{ base: 3, sm: 5, md: 7 }} spacing="lg">
        {filteredTypes.map((type) => (
          <Card
            key={type.value}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
              cursor: type.disabled ? 'not-allowed' : 'pointer',
              opacity: type.disabled ? 0.5 : 1,
            }}
            onClick={() => {
              if (!type.disabled) {
                handleContentTypeSelect(type.value);
              }
            }}
          >
            <Card.Section p="md">
              <type.icon size={rem(32)} style={{ margin: '0 auto' }} />
            </Card.Section>

            <Text fw={500} size="lg" ta="center" mt="md">
              {type.label}
            </Text>

            <Text size="sm" c="dimmed" ta="center" mt="xs">
              {type.description}
            </Text>

            {type.disabled && (
              <Text size="xs" c="dimmed" ta="center" mt="xs">
                Coming Soon
              </Text>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
