import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Group, ScrollArea, Text, Title, Paper } from '@mantine/core';
import { CONTENT_TYPES } from '../../constants/Ideahub';
import classes from '../../pages/Home.module.css';

export function ContentTypesSection() {
  const navigate = useNavigate();
  const viewport = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  const scrollRight = () => {
    if (viewport.current) {
      const { scrollLeft, scrollWidth, clientWidth } = viewport.current;
      
      if (scrollLeft + clientWidth >= scrollWidth - 50) {
        viewport.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        viewport.current.scrollBy({ left: 350, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering.current) {
        scrollRight();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box mt={120} mb={80} py={40}>
      <Title order={2} size="h1" ta="center" mb="md">
        Create Any Type of Content
      </Title>
      <Text c="dimmed" ta="center" mb={50} maw={600} mx="auto">
        From technical documentation to automated podcasts, transform your ideas into
        various content formats
      </Text>

      {/* Add a wrapper div for proper positioning context */}
      <div style={{ position: 'relative', height: 280 }}>
        <Box pos="relative" className={classes.scrollContainer}>
          <ScrollArea
            h={280}
            type="never"
            viewportRef={viewport}
            classNames={{ viewport: classes.scrollViewport }}
            onMouseEnter={() => { isHovering.current = true }}
            onMouseLeave={() => { isHovering.current = false }}
          >
            <Box className={classes.cardContainer}>
              {CONTENT_TYPES.map((type, index) => (
                <Card
                  key={index}
                  padding="xl"
                  radius="md"
                  withBorder
                  className={classes.contentTypeCard}
                  onClick={() => navigate(`/editor/idea?type=${type.value}`)}
                >
                  <Paper 
                    className={classes.iconContainer} 
                    radius="md"
                  >
                    <type.icon size={34} className={classes.contentTypeIcon} />
                  </Paper>
                
                  <Text fw={700} size="lg" mt="md" mb="xs" className={classes.contentTypeTitle}>
                    {type.label}
                  </Text>
                
                  <Text size="sm" c="dimmed" className={classes.contentTypeDescription}>
                    {type.description}
                  </Text>
                
                  {type.disabled && (
                    <Text 
                      size="xs" 
                      className={classes.comingSoonBadge}
                    >
                      Coming Soon
                    </Text>
                  )}
                </Card>
              ))}
            </Box>
          </ScrollArea>
        </Box>
      </div>
    </Box>
  );
}
