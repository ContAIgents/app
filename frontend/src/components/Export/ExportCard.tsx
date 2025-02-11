import { IconLock } from '@tabler/icons-react';
import { Badge, Button, Card, Group, Image, Text, Tooltip } from '@mantine/core';

interface ExportCardProps {
  title: string;
  content: string;
  imageSrc?: string;
  buttonText: string;
  isPremium: boolean;
  isLocked: boolean;
  onBtnClick: () => void;
}

const ExportCard = ({
  title,
  content,
  imageSrc,
  buttonText,
  isPremium,
  isLocked,
  onBtnClick,
}: ExportCardProps) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={
            imageSrc ||
            'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png'
          }
          height={160}
          alt={title}
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>{title}</Text>
        {isPremium && <Text size='xl'>✨</Text>}
      </Group>

      <Text size="sm" c="dimmed">
        {content}
      </Text>

      {isLocked ? (
        <Tooltip label="Coming Soon!">
          <Button variant="light" disabled fullWidth mt="md" radius="md" onClick={onBtnClick}>
            {buttonText} <IconLock size="1rem" />
          </Button>
        </Tooltip>
      ) : (
        <Button color="blue" fullWidth mt="md" radius="md" onClick={onBtnClick}>
          {buttonText}
        </Button>
      )}
    </Card>
  );
};

export default ExportCard;
