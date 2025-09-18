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
exports.initGithubRepo = initGithubRepo;
exports.validateToken = validateToken;
exports.initGithubRepoFromTemplate = initGithubRepoFromTemplate;
const rest_1 = require("@octokit/rest");
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
function getGithubTokenWithOptions(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (token) {
            const isValid = yield validateToken(token);
            if (isValid) {
                return token;
            }
            throw new Error('无效的 GitHub Token');
        }
        throw new Error('未提供有效的 GitHub Token');
    });
}
// 仅服务端：直接用 token 创建远程仓库
function createGithubRepoWithOptions(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const octokit = new rest_1.Octokit({
                auth: options.token,
            });
            const { data } = yield octokit.repos.createForAuthenticatedUser({
                name: options.projectName,
                description: options.description,
                private: options.isPrivate,
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
function initGithubRepo(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = yield getGithubTokenWithOptions(options.token);
            const projectName = (options.projectName || '').trim();
            if (!projectName)
                return { success: false, error: '仓库名称不能为空' };
            return createGithubRepoWithOptions({
                token,
                projectName,
                description: options.description,
                isPrivate: options.private
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : '创建 GitHub 仓库失败';
            if (typeof message === 'string' && /name already exists/i.test(message)) {
                return { success: false, error: '同名仓库已存在，请更换名称' };
            }
            return { success: false, error: message };
        }
    });
}
function initGithubRepoFromTemplate(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const token = yield getGithubTokenWithOptions(options.token);
            const name = (options.projectName || '').trim();
            if (!name)
                return { success: false, error: '仓库名称不能为空' };
            if (!options.templateOwner || !options.templateRepo)
                return { success: false, error: '缺少模板仓库信息' };
            const octokit = new rest_1.Octokit({ auth: token });
            const { data } = yield octokit.repos.createUsingTemplate({
                template_owner: options.templateOwner,
                template_repo: options.templateRepo,
                name,
                private: options.private,
                description: options.description,
                include_all_branches: (_a = options.includeAllBranches) !== null && _a !== void 0 ? _a : false,
            });
            return { success: true, repoUrl: data.html_url };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : '使用模板创建仓库失败';
            if (typeof message === 'string' && /name already exists/i.test(message)) {
                return { success: false, error: '同名仓库已存在，请更换名称' };
            }
            return { success: false, error: message };
        }
    });
}
//# sourceMappingURL=index.js.map