import { type Scaffold } from "./utils/command.js";
interface CreateOptions {
    scaffold: Scaffold;
    name: string;
    targetPath: string;
    framework?: string;
    variant?: string;
}
declare function create(options?: CreateOptions): Promise<{
    path: string;
}>;
export default create;
