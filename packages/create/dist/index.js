var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { select, input, confirm } from "@inquirer/prompts";
import os from "node:os";
import { NpmPackage } from "@pika-cli/utils";
import path from "node:path";
import ora from "ora";
// @ts-ignore
import fse from "fs-extra";
import { glob } from "glob";
import ejs from "ejs";
function create() {
    return __awaiter(this, void 0, void 0, function* () {
        // 选择项目模版
        const projectTemplate = yield select({
            message: '请选择项目模版',
            choices: [
                {
                    name: 'react 项目',
                    value: '@guang-cli/template-react'
                },
                {
                    name: 'vue 项目',
                    value: '@guang-cli/template-vue'
                }
            ],
        });
        // 输入项目名
        let projectName = '';
        while (!projectName) {
            projectName = yield input({ message: '请输入项目名' });
        }
        // 检查项目目录是否存在
        const targetPath = path.join(process.cwd(), projectName);
        if (fse.existsSync(targetPath)) {
            const empty = yield select({
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
            if (empty) {
                fse.emptyDirSync(targetPath);
            }
            else {
                process.exit(0);
            }
        }
        // 下载/更新模版
        const pkg = new NpmPackage({
            name: projectTemplate,
            targetPath: path.join(os.homedir(), '.guang-cli-template')
        });
        if (!(yield pkg.exists())) {
            const spinner = ora('下载模版中...').start();
            yield pkg.install();
            spinner.stop();
        }
        else {
            const spinner = ora('更新模版中...').start();
            yield pkg.update();
            spinner.stop();
        }
        const spinner = ora('创建项目中...').start();
        // 将模版复制到项目目录
        const templatePath = path.join(pkg.npmFilePath, 'template');
        fse.copySync(templatePath, targetPath);
        spinner.stop();
        // 渲染ejs模版文件
        const renderData = { projectName };
        const deleteFiles = [];
        const questionConfigPath = path.join(pkg.npmFilePath, 'questions.json');
        // 选择是否启用某些配置
        if (fse.existsSync(questionConfigPath)) {
            const config = fse.readJSONSync(questionConfigPath);
            for (let key in config) {
                const res = yield confirm({ message: '是否启用 ' + key });
                renderData[key] = res;
                if (!res) {
                    deleteFiles.push(...config[key].files);
                }
            }
        }
        const files = yield glob('**', {
            cwd: targetPath,
            nodir: true,
            ignore: 'node_modules/**'
        });
        for (let i = 0; i < files.length; i++) {
            const filePath = path.join(targetPath, files[i]);
            const renderResult = yield ejs.renderFile(filePath, renderData);
            fse.writeFileSync(filePath, renderResult);
        }
        // 删除临时目录的模版
        deleteFiles.forEach(item => {
            fse.removeSync(path.join(targetPath, item));
        });
        console.log(`项目创建成功： ${targetPath}`);
    });
}
export default create;
//# sourceMappingURL=index.js.map