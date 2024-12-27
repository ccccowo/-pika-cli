#!/usr/bin/env node
import create from '@pika-cli/create';
import generate from '@pika-cli/generate'
import { Command } from 'commander';
import fse from 'fs-extra';
import path from 'node:path';

const pkgJson = fse.readJSONSync(path.join(import.meta.dirname, '../package.json'));

const program = new Command();

program
    .name('pika-cli')
    .description('脚手架 cli')
    .version(pkgJson.version);

    program
    .command('create')
    .description('创建项目')
    .action(async () => {
      try {
        await create();
      } catch (error) {
        console.error('创建项目失败:', error);
        process.exit(1);
      }
    });
  
  // generate 命令才需要 generate.config.js
  program
    .command('generate')
    .description('生成代码')
    .action(async () => {
      try {
        await generate();
      } catch (error) {
        console.error('生成代码失败:', error);
        process.exit(1);
      }
    });

program.parse();
