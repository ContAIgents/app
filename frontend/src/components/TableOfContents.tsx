import { IconListSearch } from '@tabler/icons-react';
import cx from 'clsx';
import { Box, Text } from '@mantine/core';
import classes from './TableOfContents.module.css';
import { useEffect, useState } from 'react';

interface TableOfContentsProps {
  links: { label: string; link: string; order: number }[];
}

export function TableOfContents({ links }: TableOfContentsProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    // Find the main content container - the div with overflowY: 'auto'
    const mainContent = document.querySelector('div[style*="overflowY: auto"]') as HTMLElement;
    if (!mainContent) return;

    const handleScroll = () => {
      const sections = links.map(link => ({
        id: link.link.substring(1),
        top: document.getElementById(link.link.substring(1))?.getBoundingClientRect().top || 0
      }));

      // Add the scroll position to get the absolute position
      const scrollTop = mainContent.scrollTop;
      const viewportHeight = mainContent.clientHeight;
      
      // Find the section that's currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionTop = sections[i].top + scrollTop;
        if (scrollTop >= sectionTop - 100) { // 100px offset for better UX
          setActive(sections[i].id);
          break;
        }
      }
    };

    mainContent.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, [links]);

  const scrollToSection = (link: string) => {
    const mainContent = document.querySelector('div[style*="overflowY: auto"]') as HTMLElement;
    const element = document.getElementById(link.substring(1));
    
    if (element && mainContent) {
      const elementTop = element.getBoundingClientRect().top;
      const containerTop = mainContent.getBoundingClientRect().top;
      const relativeTop = elementTop - containerTop + mainContent.scrollTop;
      
      mainContent.scrollTo({
        top: relativeTop - 20, // 20px offset from the top
        behavior: 'smooth'
      });
    }
  };

  const items = links.map((item) => (
    <Box<'button'>
      component="button"
      key={item.label}
      onClick={() => scrollToSection(item.link)}
      className={cx(classes.link, { 
        [classes.linkActive]: active === item.link.substring(1)
      })}
      style={{ paddingLeft: `calc(${item.order} * var(--mantine-spacing-md))` }}
    >
      {item.label}
    </Box>
  ));

  return (
    <div>
      {items}
    </div>
  );
}

