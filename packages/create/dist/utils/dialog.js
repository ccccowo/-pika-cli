var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';
const execAsync = promisify(exec);
export function selectFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        const os = platform();
        try {
            if (os === 'win32') {
                // Windows 使用 PowerShell 命令
                const { stdout } = yield execAsync(`
        Add-Type -AssemblyName System.Windows.Forms
        $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
        $dialog.Description = "选择项目路径"
        $dialog.ShowNewFolderButton = $true
        [void]$dialog.ShowDialog()
        $dialog.SelectedPath
      `, { shell: 'powershell' });
                return stdout.trim();
            }
            else {
                // macOS/Linux 使用 zenity
                const { stdout } = yield execAsync('zenity --file-selection --directory');
                return stdout.trim();
            }
        }
        catch (error) {
            throw new Error('选择文件夹失败');
        }
    });
}
//# sourceMappingURL=dialog.js.map