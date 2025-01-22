"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGithubRepo = createGithubRepo;
exports.validateToken = validateToken;
const rest_1 = require("@octokit/rest");
const node_child_process_1 = require("node:child_process");
function validateToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const octokit = new rest_1.Octokit({ auth: token });
            yield octokit.rest.users.getAuthenticated();
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
function checkGitEnvironment() {
    try {
        (0, node_child_process_1.execSync)('git --version', { stdio: 'ignore' });
        return true;
    }
    catch (_a) {
        return false;
    }
}
function createGithubRepo(_a) {
    return __awaiter(this, arguments, void 0, function* ({ token, projectName, projectPath, description = '', isPrivate = false, }) {
        if (!checkGitEnvironment()) {
            return {
                success: false,
                error: '请先安装 Git'
            };
        }
        try {
            const octokit = new rest_1.Octokit({
                auth: token,
            });
            const { data } = yield octokit.repos.createForAuthenticatedUser({
                name: projectName,
                description,
                private: isPrivate,
            });
            const sshUrl = data.ssh_url;
            const commands = [
                'git init',
                'git add .',
                'git commit -m "Initial commit"',
                'git branch -M main',
                `git remote add origin ${sshUrl}`,
                'git push -u origin main'
            ];
            commands.forEach(cmd => {
                (0, node_child_process_1.execSync)(cmd, {
                    cwd: projectPath,
                    stdio: 'inherit'
                });
            });
            return {
                success: true,
                repoUrl: data.html_url
            };
        }
        catch (error) {
            console.error('详细错误：', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '创建 GitHub 仓库失败'
            };
        }
    });
}
//# sourceMappingURL=index.js.map