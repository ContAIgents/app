import { IconListSearch } from '@tabler/icons-react';
import cx from 'clsx';
import { Box, Group, Text } from '@mantine/core';
import classes from './TableOfContents.module.css';
const active = '#overlays';

export function TableOfContents({links}) {
  const items = links.map((item) => (
    <Box<'a'>
      component="a"
      href={item.link}
      onClick={(event) => event.preventDefault()}
      key={item.label}
      className={cx(classes.link, { [classes.linkActive]: active === item.link })}
      style={{ paddingLeft: `calc(${item.order} * var(--mantine-spacing-md))` }}
    >
      {item.label}
    </Box>
  ));

  return (
    <div>
      <Group mb="md">
        {/* <IconListSearch size={18} stroke={1.5} /> */}
        {/* <Text>Table of contents</Text> */}
      </Group>
      {items}
    </div>
  );
}

