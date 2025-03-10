import { useNavigate } from 'react-router-dom';
import { Affix, Container, Button, rem } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { ContentTypesSection } from '@/components/Home/ContentTypesSection';
import { HeroSection } from '@/components/Home/HeroSection';
import { WorkflowSection } from '@/components/Home/WorkflowSection';
import { UsageModesSection } from '@/components/Home/UsageModesSection';
import { PersonasSection } from '@/components/Home/PersonasSection';
import { FooterSection } from '@/components/Home/FooterSection';
import classes from './Home.module.css';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Container size="xl">
        <HeroSection />
        <ContentTypesSection />
        <PersonasSection />
        <WorkflowSection />
        <UsageModesSection />
      </Container>

      <Affix position={{ bottom: rem(40), left: '50%' }} style={{ transform: 'translateX(-50%)' }}>
        <Button
          size="lg"
          className={classes.ctaButton}
          radius="md"
          onClick={() => navigate('/getStarted')}
          rightSection={<IconArrowRight size={20} stroke={2} />}
        >
          Start Creating Now
        </Button>
      </Affix>

      <FooterSection />
    </>
  );
}

export default HomePage;
