#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import create from '@pika-cli/create';
import generate from '@pika-cli/generate';
import { Command } from 'commander';
import fse from 'fs-extra';
import path from 'node:path';
const pkgJson = fse.readJSONSync(path.join(import.meta.dirname, '../package.json'));
const program = new Command();
program
    .name('pika-cli')
    .description('脚手架 cli')
    .version(pkgJson.version);
program.command('create')
    .description('创建项目')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    create();
}));
program.command('generate')
    .description('生成代码')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    generate();
}));
program.parse();
//# sourceMappingURL=index.js.map