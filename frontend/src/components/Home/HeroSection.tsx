import { Box, Image, Paper, Text, Title } from '@mantine/core';
import favicon from '../../favicon.svg';
import classes from '../../pages/Home.module.css';

export function HeroSection() {
  return (
    <Paper className={`${classes.paperWrapper} ${classes.gradientBackground}`}>
      <Box className={classes.titleWrapper}>
        <Title c={'white'} order={1} size="2rem" fw={900} ta="center" mb="0">
          Develop content with your personalised AI workforce
        </Title>
        <Text c={'white'} ta="center" size="md" fw={500} mb="md" opacity={0.5}>
          Local First Platform | Open Source | LLM of Your Choice
        </Text>
      </Box>

      <Box className={classes.faviconWrapper}>
        <Image src={favicon} alt="logo" className={classes.faviconImage} />
      </Box>
    </Paper>
  );
}
