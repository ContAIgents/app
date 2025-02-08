#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');

program
  .version('1.0.0')
  .description('AI Content Ecosystem CLI')
  .action(() => {
    require(path.join(__dirname, '../dist/index.js'));
  });

program.parse(process.argv);
