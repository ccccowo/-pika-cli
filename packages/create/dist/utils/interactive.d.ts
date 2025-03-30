import type { Scaffold } from './command.js';
interface CommandOptions {
    scaffold: Scaffold;
    packageManager: string;
    createCommand: string[];
    projectName: string;
    projectPath: string;
    framework?: string;
    variant?: string;
}
export declare function executeInteractiveCommand(options: CommandOptions): Promise<boolean>;
export {};
