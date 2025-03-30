// 支持的脚手架类型
export type Scaffold = 'vite' | 'next';

// 命令配置
interface CommandConfig {
  packageManager: string;
  createCommand: string[];
  framework?: string;
  variant?: string;
}

// 脚手架命令映射
const scaffoldCommands: Record<Scaffold, (framework?: string, variant?: string) => CommandConfig> = {
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

export function parseScaffoldCommand(scaffold: Scaffold, framework?: string, variant?: string): CommandConfig {
  const commandGenerator = scaffoldCommands[scaffold];
  if (!commandGenerator) {
    throw new Error(`不支持的脚手架类型: ${scaffold}`);
  }
  return commandGenerator(framework, variant);
} 