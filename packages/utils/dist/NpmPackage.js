var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs";
// @ts-ignore
import fse from "fs-extra";
import path from "node:path";
// @ts-ignore
import npminstall from "npminstall";
import { getLatestVersion, getNpmRegistry } from "./versionUtils.js";
class NpmPackage {
    constructor(options) {
        this.name = "";
        this.version = "";
        this.targetPath = "";
        this.storePath = "";
        this.name = options.name;
        this.targetPath = options.targetPath;
        this.storePath = path.resolve(options.targetPath, "node_modules");
    }
    // 准备安装
    prepare() {
        return __awaiter(this, void 0, void 0, function* () {
            // 创建安装的目标路径
            if (!fs.existsSync(this.targetPath)) {
                yield fse.mkdirpSync(this.targetPath);
            }
            this.version = yield getLatestVersion(this.name);
        });
    }
    // 安装
    install() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prepare();
            return npminstall({
                root: this.targetPath,
                registry: getNpmRegistry(),
                pkgs: [
                    {
                        name: this.name,
                        version: this.version,
                    },
                ],
            });
        });
    }
    // 获取npm包存储路径
    get npmFilePath() {
        return path.resolve(this.storePath, `.store/${this.name.replace("/", "+")}@${this.version}/node_modules/${this.name}`);
    }
    // 判断npm包是否存在
    exists() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prepare();
            return fs.existsSync(this.npmFilePath);
        });
    }
    // 获取npm包package.json信息
    getPackageJSON() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.exists()) {
                return fse.readJsonSync(path.resolve(this.npmFilePath, "package.json"));
            }
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastestVersion = yield getLatestVersion(this.name);
            return npminstall({
                root: this.targetPath,
                registry: getNpmRegistry(),
                pkgs: [
                    {
                        name: this.name,
                        version: lastestVersion,
                    },
                ],
            });
        });
    }
}
export default NpmPackage;
//# sourceMappingURL=NpmPackage.js.map