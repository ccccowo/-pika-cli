import fs from "fs";
// @ts-ignore
import fse from "fs-extra";
import path from "node:path";
// @ts-ignore
import npminstall from "npminstall";
import { getLatestVersion, getNpmRegistry } from "./versionUtils.js";

export interface NpmPackageOptions {
  name: string;
  targetPath: string;
}

class NpmPackage {
  name: string = "";
  version: string = "";
  targetPath: string = "";
  storePath: string = "";

  constructor(options: NpmPackageOptions) {
    this.name = options.name;
    this.targetPath = options.targetPath;
    this.storePath = path.resolve(options.targetPath, "node_modules");
  }

  // 准备安装
  async prepare() {
    // 创建安装的目标路径
    if (!fs.existsSync(this.targetPath)) {
      await fse.mkdirpSync(this.targetPath);
    }
    this.version = await getLatestVersion(this.name);
  }

  // 安装
  async install() {
    await this.prepare();
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
  }

  // 获取npm包存储路径
  get npmFilePath() {
    return path.resolve(
      this.storePath,
      `.store/${this.name.replace("/", "+")}@${this.version}/node_modules/${
        this.name
      }`
    );
  }

  // 判断npm包是否存在
  async exists() {
    await this.prepare();
    return fs.existsSync(this.npmFilePath);
  }

  // 获取npm包package.json信息
  async getPackageJSON() {
    if (await this.exists()) {
      return fse.readJsonSync(path.resolve(this.npmFilePath, "package.json"));
    }
  }

  async update() {
    const lastestVersion = await getLatestVersion(this.name);
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
  }
}

export default NpmPackage;