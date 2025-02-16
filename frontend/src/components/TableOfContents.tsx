import { IconListSearch } from '@tabler/icons-react';
import cx from 'clsx';
import { Box, Text } from '@mantine/core';
import classes from './TableOfContents.module.css';
import { useEffect, useState, useRef } from 'react';

interface TableOfContentsProps {
  links: { label: string; link: string; order: number }[];
}

export function TableOfContents({ links }: TableOfContentsProps) {
  const [active, setActive] = useState<string | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store the ref to main content
    mainContentRef.current = document.querySelector('div[role="main"]');
    if (!mainContentRef.current) return;

    const handleScroll = () => {
      if (!mainContentRef.current) return;

      const sections = links.map(link => ({
        id: link.link.substring(1),
        element: document.getElementById(link.link.substring(1))
      }));

      const scrollTop = mainContentRef.current.scrollTop;
      const viewportHeight = mainContentRef.current.clientHeight;

      // Find the section that's currently in view
      let currentSection = null;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (!section.element) continue;

        const rect = section.element.getBoundingClientRect();
        const mainRect = mainContentRef.current.getBoundingClientRect();
        const topRelativeToContainer = rect.top - mainRect.top;

        if (topRelativeToContainer <= 100) { // 100px offset for better UX
          currentSection = section.id;
          break;
        }
      }

      setActive(currentSection);
    };

    mainContentRef.current.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      mainContentRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [links]);

  const scrollToSection = (link: string) => {
    if (!mainContentRef.current) return;

    const element = document.getElementById(link.substring(1));
    if (!element) return;

    const elementRect = element.getBoundingClientRect();
    const containerRect = mainContentRef.current.getBoundingClientRect();
    const relativeTop = elementRect.top - containerRect.top + mainContentRef.current.scrollTop;

    mainContentRef.current.scrollTo({
      top: relativeTop - 20, // 20px offset from the top
      behavior: 'smooth'
    });
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

