import { select, input, confirm } from "@inquirer/prompts";
import os from "node:os";
import { NpmPackage } from "@pika-cli/utils";
import path from "node:path";
import ora from "ora";
// @ts-ignore
import fse from "fs-extra";
import { glob } from "glob";
import ejs from "ejs";


async function getGithubToken(): Promise<string> {
    console.log('\n关于 GitHub Token:');
    console.log('1. Token 用于访问 GitHub API，创建仓库');
    console.log('2. 获取方式：');
    console.log('   - 访问 https://github.com/settings/tokens');
    console.log('   - 点击 "Generate new token (classic)"');
    console.log('   - 填写 Note（备注）');
    console.log('   - 选择有效期（建议30天）');
    console.log('   - 勾选 repo 权限（完整仓库访问权限）');
    console.log('   - 点击底部的 "Generate token"\n');

    let token = '';
    let isValid = false;

    while (!isValid) {
        token = await input({ 
            message: '请输入 GitHub Token'
        });

        const { validateToken } = await import('@pika-cli/github');
        isValid = await validateToken(token);

        if (!isValid) {
            console.log('\n❌ Token 无效或权限不足');
            console.log('可能的原因：');
            console.log('1. Token 输入错误');
            console.log('2. Token 已过期');
            console.log('3. Token 没有 repo 权限\n');

            const retry = await select({
                message: '请选择操作',
                choices: [
                    { 
                        name: '重新输入 Token', 
                        value: 'retry' 
                    },
                    { 
                        name: '查看 Token 创建教程', 
                        value: 'guide' 
                    },
                    { 
                        name: '跳过创建 GitHub 仓库', 
                        value: 'skip' 
                    }
                ]
            });

            if (retry === 'guide') {
                console.log('\n创建 Token 步骤：');
                console.log('1. 访问 https://github.com/settings/tokens');
                console.log('2. 点击 "Generate new token (classic)"');
                console.log('3. 填写 Note: pika-cli');
                console.log('4. 选择有效期（建议30天）');
                console.log('5. 勾选 repo 权限');
                console.log('6. 点击底部的 "Generate token"');
                console.log('7. 复制生成的 token（注意：token 只显示一次）\n');
                continue;
            }

            if (retry === 'skip') {
                return '';
            }
        }
    }

    return token;
}

async function create() {

    // 选择项目模版
    const projectTemplate = await select({
        message: '请选择项目模版',
        choices: [
          {
            name: 'react 项目',
            value: '@pika-cli/template-react-ui-ts'
          },
          {
            name: 'vue 项目',
            value: '@guang-cli/template-vue'
          }
        ],
    });

    // 输入项目名
    let projectName = '';
    while(!projectName) {
        projectName = await input({ message: '请输入项目名' });
    }

    // 检查项目目录是否存在
    const targetPath = path.join(process.cwd(), projectName);
    if(fse.existsSync(targetPath)) {
        const empty = await select({
            message: '该目录不为空，是否清空',
            choices: [
                {
                    name: '是',
                    value: true
                },
                {
                    name: '否', 
                    value: false
                }
            ]
        });
        if(empty) {
            fse.emptyDirSync(targetPath);
        } else {
            process.exit(0);
        }
    }

    // 下载/更新模版
    const pkg = new NpmPackage({
        name: projectTemplate,
        targetPath: path.join(os.homedir(), '.guang-cli-template')
    });

    if (!await pkg.exists()) {
        const spinner = ora('下载模版中...').start();
        await pkg.install();
        spinner.stop();
    } else {
        const spinner = ora('更新模版中...').start();
        await pkg.update();
        spinner.stop();
    }
    const spinner = ora('创建项目中...').start();

    // 将模版复制到项目目录
    const templatePath = path.join(pkg.npmFilePath, 'template');
    fse.copySync(templatePath, targetPath);
    spinner.stop();

    // 渲染ejs模版文件
    const renderData: Record<string, any> = { projectName };
    const deleteFiles: string[] = [];
    const questionConfigPath = path.join(pkg.npmFilePath, 'questions.json');
    // 选择是否启用某些配置
    if(fse.existsSync(questionConfigPath)) {
        const config = fse.readJSONSync(questionConfigPath);
        for (let key in config) {
            const res = await confirm({ message: '是否启用 ' + key });
            renderData[key] = res;
            if (!res) {
                deleteFiles.push(...config[key].files)
            }
        }
    }
    const files = await glob('**', {
        cwd: targetPath,
        nodir: true,
        ignore: 'node_modules/**'
    })
    for (let i = 0; i< files.length; i++) {
        const filePath = path.join(targetPath, files[i]);
        const renderResult = await ejs.renderFile(filePath, renderData)
        fse.writeFileSync(filePath, renderResult);
    }

    // 删除临时目录的模版
    deleteFiles.forEach(item => {
        fse.removeSync(path.join(targetPath, item));
    })

    console.log(`\n✨ 本地项目创建成功： ${targetPath}`);
    console.log('现在你可以：');
    console.log(`  cd ${projectName}`);
    console.log('  pnpm install');
    console.log('  pnpm dev\n');

    // 询问是否创建 GitHub 仓库
    const createGithubRepo = await select({
        message: '是否创建 GitHub 仓库？',
        choices: [
            { name: '是', value: true },
            { name: '否', value: false }
        ]
    });

    if (createGithubRepo) {
        const token = await getGithubToken();
        
        if (!token) {
            console.log('已跳过创建 GitHub 仓库');
            return;
        }

        const { createGithubRepo } = await import('@pika-cli/github');
        
        const result = await createGithubRepo({
            token,
            projectName,
            projectPath: targetPath
        });

        if (result.success) {
            console.log(`\n✨ GitHub 仓库创建成功：${result.repoUrl}`);
        } else {
            console.error(`\n❌ GitHub 仓库创建失败：${result.error}`);
        }
    }
}

export default create;