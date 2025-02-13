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

program
    .command('github')
    .description('创建 GitHub 仓库并关联本地项目')
    .option('-p, --private', '是否为私有仓库')
    .option('-d, --description <description>', '仓库描述')
    .action(async (options) => {
        try {
            const { initGithubRepo } = await import('@pika-cli/github');
            await initGithubRepo(options);
        } catch (error) {
            console.error('GitHub 仓库操作失败:', error);
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
