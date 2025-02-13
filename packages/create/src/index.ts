import { select, input, confirm } from "@inquirer/prompts";
import os from "node:os";
import { NpmPackage } from "@pika-cli/utils";
import path from "node:path";
import ora from "ora";
// @ts-ignore
import fse from "fs-extra";
import { glob } from "glob";
import ejs from "ejs";

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
    console.log('  pnpm dev');
    console.log('  pika github    # 创建 GitHub 仓库\n');
}

export default create;