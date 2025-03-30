var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { spawn } from 'child_process';
// 不同脚手架的交互提示
const scaffoldPrompts = {
    vite: ['Project name:', 'Select a framework:', 'Select a variant:'],
    next: ['Project name:']
};
// 按键映射
const KEYS = {
    ENTER: '\r',
    UP: '\u001b[A',
    DOWN: '\u001b[B'
};
// 框架选项的顺序
const FRAMEWORK_ORDER = [
    'vanilla',
    'vue',
    'react',
    'preact',
    'lit',
    'svelte',
    'solid',
    'qwik',
    'angular'
];
// 变体选项的顺序
const VARIANT_ORDER = [
    'typescript',
    'javascript'
];
function getKeysForSelection(current, target, options) {
    const currentIndex = options.indexOf(current);
    const targetIndex = options.indexOf(target);
    if (currentIndex === -1 || targetIndex === -1) {
        return [];
    }
    const keys = [];
    const distance = targetIndex - currentIndex;
    const key = distance > 0 ? KEYS.DOWN : KEYS.UP;
    const times = Math.abs(distance);
    for (let i = 0; i < times; i++) {
        keys.push(key);
    }
    return keys;
}
export function executeInteractiveCommand(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('开始创建项目...');
            console.log('项目路径:', options.projectPath);
            console.log('项目名称:', options.projectName);
            console.log('选择框架:', options.framework || 'react');
            console.log('选择变体:', options.variant || 'typescript');
            // 构建命令参数
            const args = [
                'create',
                'vite@latest',
                options.projectName
            ];
            return new Promise((resolve) => {
                var _a, _b;
                const child = spawn('npm', args, {
                    cwd: options.projectPath,
                    stdio: ['pipe', 'pipe', 'pipe'],
                    shell: true
                });
                let buffer = '';
                let currentStep = 0;
                let success = false;
                // 监听输出
                (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
                    const output = data.toString();
                    buffer += output;
                    // 检查是否包含成功提示
                    if (output.includes('Done. Now run:')) {
                        success = true;
                        console.log('✨ 项目创建成功！');
                        console.log(`📁 项目路径: ${options.projectPath}\\${options.projectName}`);
                        // 立即结束进程
                        child.kill();
                        resolve(true);
                        return;
                    }
                    // 根据输出内容判断当前步骤
                    if (buffer.includes('Select a framework:') && currentStep === 0) {
                        currentStep = 1;
                        console.log('🎯 选择框架中...');
                        // 选择框架
                        setTimeout(() => {
                            var _a, _b;
                            const keys = getKeysForSelection('vanilla', options.framework || 'react', FRAMEWORK_ORDER);
                            for (const key of keys) {
                                (_a = child.stdin) === null || _a === void 0 ? void 0 : _a.write(key);
                            }
                            (_b = child.stdin) === null || _b === void 0 ? void 0 : _b.write(KEYS.ENTER);
                            console.log(`✅ 已选择框架: ${options.framework || 'react'}`);
                        }, 500);
                    }
                    else if (buffer.includes('Select a variant:') && currentStep === 1) {
                        currentStep = 2;
                        console.log('🎯 选择变体中...');
                        // 选择变体
                        setTimeout(() => {
                            var _a, _b;
                            const keys = getKeysForSelection('typescript', options.variant || 'typescript', VARIANT_ORDER);
                            for (const key of keys) {
                                (_a = child.stdin) === null || _a === void 0 ? void 0 : _a.write(key);
                            }
                            (_b = child.stdin) === null || _b === void 0 ? void 0 : _b.write(KEYS.ENTER);
                            console.log(`✅ 已选择变体: ${options.variant || 'typescript'}`);
                        }, 500);
                    }
                });
                // 监听错误
                (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
                    console.error('❌ 错误输出:', data.toString());
                });
                // 监听进程结束
                child.on('exit', (code) => {
                    if (success) {
                        console.log('🎉 命令执行完成！');
                        console.log('👉 下一步:');
                        console.log(`   cd ${options.projectName}`);
                        console.log('   pnpm install');
                        console.log('   pnpm run dev');
                        resolve(true);
                    }
                    else {
                        console.error('❌ 命令执行失败，退出码:', code);
                        resolve(false);
                    }
                });
                // 监听错误
                child.on('error', (error) => {
                    console.error('❌ 进程错误:', error);
                    resolve(false);
                });
            });
        }
        catch (error) {
            console.error('❌ 执行命令出错:', error);
            return false;
        }
    });
}
//# sourceMappingURL=interactive.js.map