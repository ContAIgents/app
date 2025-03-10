import { IconBrandDiscord, IconBrandGithub, IconBrandTwitter } from '@tabler/icons-react';
import { ActionIcon, Box, Container, Divider, Group, Stack, Text } from '@mantine/core';
import classes from '../../pages/Home.module.css';

export function FooterSection() {
  return (
    <Box className={classes.footer}>
      <Container size="xl">
        <div className={classes.footerInner}>
          <div className={classes.footerGroups}>
            <Stack>
              <Text size="xl" fw={700}>
                Contaigents
              </Text>
              <Text component="a" href="/getStarted" c="dimmed">
                Get Started
              </Text>
            </Stack>

            <Stack ta="center">
              <Text size="lg" fw={500}>
                Resources
              </Text>
              <Text component="a" href="/#" c="dimmed">
                Documentation
              </Text>
              <Text component="a" href="/#" c="dimmed">
                Blog
              </Text>
              <Text component="a" href="/#" c="dimmed">
                Support
              </Text>
            </Stack>

            <Stack ta="right">
              <Text size="lg" fw={500}>
                Company
              </Text>
              <Text component="a" href="/#" c="dimmed">
                About
              </Text>
              <Text component="a" href="/#" c="dimmed">
                Privacy
              </Text>
              <Text component="a" href="/#" c="dimmed">
                Terms
              </Text>
            </Stack>
          </div>

          <Divider my="sm" />

          <Group justify="space-between" className={classes.footerAfter}>
            <Text size="sm" c="dimmed">
              © 2025 Contaigents. All rights reserved.
            </Text>

            <Group gap="xs" justify="flex-end" wrap="nowrap">
              <ActionIcon size="lg" color="gray" variant="subtle">
                <IconBrandTwitter style={{ width: 18, height: 18 }} stroke={1.5} />
              </ActionIcon>
              <ActionIcon size="lg" color="gray" variant="subtle">
                <IconBrandGithub style={{ width: 18, height: 18 }} stroke={1.5} />
              </ActionIcon>
              <ActionIcon size="lg" color="gray" variant="subtle">
                <IconBrandDiscord style={{ width: 18, height: 18 }} stroke={1.5} />
              </ActionIcon>
            </Group>
          </Group>
        </div>
      </Container>
    </Box>
  );
}
