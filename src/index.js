#!/usr/bin/env node

import { Command } from 'commander';
import { runCli } from './runner.js';

const program = new Command();

program
    .name('ng-init')
    .description('Angular project initializer with library pre-install')
    .version('1.0.0');

program.action(() => {
    runCli();
});

program.parse(process.argv);
