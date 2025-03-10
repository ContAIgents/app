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
  Box,
} from '@mantine/core';
import { CONTENT_TYPES, CONTENT_CATEGORIES } from '../constants/Ideahub';
import classes from './GetStarted.module.css';

export function GetStarted() {
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
        size="2rem"
        fw={900}
        ta="center"
        mb="md"
      >
        What do you want to create today? 
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
              size="sm"
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
            className={`${classes.card} ${type.disabled ? classes.cardDisabled : ''}`}
            onClick={() => {
              if (!type.disabled) {
                handleContentTypeSelect(type.value);
              }
            }}
          >
            <Card.Section p="md">
              <Box className={classes.iconWrapper}>
                <type.icon
                  size={rem(18)}
                  className={classes.icon}
                />
              </Box>
            </Card.Section>

            <Text 
              size="sm"
              className={classes.cardTitle}
            >
              {type.label}
            </Text>

            <Text 
              size="xs" 
              c="dimmed"
              className={classes.cardDescription}
            >
              {type.description}
            </Text>

            {type.disabled && (
              <Text 
                size="xs" 
                c="dimmed"
                className={classes.comingSoon}
              >
                Coming Soon
              </Text>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
