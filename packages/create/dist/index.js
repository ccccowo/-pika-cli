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
import path from "node:path";
import ora from "ora";
import { executeInteractiveCommand } from "./utils/interactive.js";
import { parseScaffoldCommand } from "./utils/command.js";
// API 模式：直接使用传入的参数创建项目
function createWithOptions(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { scaffold, name, targetPath, framework, variant } = options;
        const spinner = ora('创建项目中...').start();
        try {
            // 获取命令配置
            const commandConfig = parseScaffoldCommand(scaffold, framework, variant);
            // 使用交互式命令创建项目
            const success = yield executeInteractiveCommand(Object.assign(Object.assign({ scaffold }, commandConfig), { projectName: name, projectPath: targetPath }));
            if (!success) {
                throw new Error('项目创建失败');
            }
            spinner.succeed('项目创建成功');
            return { path: path.join(targetPath, name) };
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
        // 选择脚手架
        const scaffold = yield select({
            message: '请选择脚手架',
            choices: [
                {
                    name: 'Vite',
                    value: 'vite'
                },
                {
                    name: 'Next.js',
                    value: 'next'
                }
            ],
        });
        // 如果选择了 Vite，还需要选择框架和变体
        let framework;
        let variant;
        if (scaffold === 'vite') {
            framework = yield select({
                message: '请选择框架',
                choices: [
                    { name: 'React', value: 'react' },
                    { name: 'Vue', value: 'vue' },
                    { name: 'Svelte', value: 'svelte' }
                ]
            });
            variant = yield select({
                message: '请选择变体',
                choices: [
                    { name: 'TypeScript', value: 'typescript' },
                    { name: 'JavaScript', value: 'javascript' }
                ]
            });
        }
        // 输入项目名
        let projectName = '';
        while (!projectName) {
            projectName = yield input({ message: '请输入项目名' });
        }
        // 输入项目路径
        const projectPath = yield input({
            message: '请输入项目路径',
            default: process.cwd()
        });
        return createWithOptions({
            scaffold,
            name: projectName,
            targetPath: projectPath,
            framework,
            variant
        });
    });
}
// 统一入口：根据是否传入参数决定使用哪种模式
function create(options) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((options === null || options === void 0 ? void 0 : options.scaffold) && (options === null || options === void 0 ? void 0 : options.name) && (options === null || options === void 0 ? void 0 : options.targetPath)) {
            return createWithOptions(options);
        }
        return createWithPrompts();
    });
}
export default create;
//# sourceMappingURL=index.js.map