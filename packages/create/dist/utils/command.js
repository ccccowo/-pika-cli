// 脚手架命令映射
const scaffoldCommands = {
    vite: (framework = 'react', variant = 'typescript') => ({
        packageManager: 'pnpm',
        createCommand: ['create', 'vite@latest'],
        framework,
        variant
    }),
    next: () => ({
        packageManager: 'npx',
        createCommand: ['create-next-app@latest'],
    })
};
export function parseScaffoldCommand(scaffold, framework, variant) {
    const commandGenerator = scaffoldCommands[scaffold];
    if (!commandGenerator) {
        throw new Error(`不支持的脚手架类型: ${scaffold}`);
    }
    return commandGenerator(framework, variant);
}
//# sourceMappingURL=command.js.map