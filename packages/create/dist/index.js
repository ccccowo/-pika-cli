var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { select, input } from "@inquirer/prompts";
import os from "node:os";
import { NpmPackage } from "@pika-cli/utils";
import path from "node:path";
import ora from "ora";
// @ts-ignore
import fse from "fs-extra";
import { glob } from "glob";
import ejs from "ejs";
// API 模式：直接使用传入的参数创建项目
function createWithOptions(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { template, name, targetPath = process.cwd() } = options;
        if (!template || !name) {
            throw new Error('template 和 name 是必需的');
        }
        // 检查项目目录是否存在
        const projectPath = path.join(targetPath, name);
        if (fse.existsSync(projectPath)) {
            fse.emptyDirSync(projectPath);
        }
        // 下载/更新模版
        const pkg = new NpmPackage({
            name: template,
            targetPath: path.join(os.homedir(), '.guang-cli-template')
        });
        const spinner = ora('处理模板中...').start();
        try {
            if (!(yield pkg.exists())) {
                yield pkg.install();
            }
            else {
                yield pkg.update();
            }
            // 将模版复制到项目目录
            const templatePath = path.join(pkg.npmFilePath, 'template');
            fse.copySync(templatePath, projectPath);
            // 渲染ejs模版文件
            const renderData = { projectName: name };
            const files = yield glob('**', {
                cwd: projectPath,
                nodir: true,
                ignore: 'node_modules/**'
            });
            for (const file of files) {
                const filePath = path.join(projectPath, file);
                const renderResult = yield ejs.renderFile(filePath, renderData);
                fse.writeFileSync(filePath, renderResult);
            }
            spinner.succeed('项目创建成功');
            return { path: projectPath };
        }
        catch (error) {
            spinner.fail('项目创建失败');
            throw error;
        }
    });
}
// CLI 模式：通过命令行交互获取参数
function createWithPrompts() {
    return __awaiter(this, void 0, void 0, function* () {
        // 选择项目模版
        const projectTemplate = yield select({
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
        while (!projectName) {
            projectName = yield input({ message: '请输入项目名' });
        }
        return createWithOptions({
            template: projectTemplate,
            name: projectName
        });
    });
}
// 统一入口：根据是否传入参数决定使用哪种模式
function create(options) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((options === null || options === void 0 ? void 0 : options.template) && (options === null || options === void 0 ? void 0 : options.name)) {
            return createWithOptions(options);
        }
        return createWithPrompts();
    });
}
export default create;
//# sourceMappingURL=index.js.map