export type Scaffold = 'vite' | 'next';
interface CommandConfig {
    packageManager: string;
    createCommand: string[];
    framework?: string;
    variant?: string;
}
export declare function parseScaffoldCommand(scaffold: Scaffold, framework?: string, variant?: string): CommandConfig;
export {};
