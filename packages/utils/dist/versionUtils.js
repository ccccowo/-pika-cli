var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import url from 'url-join';
// 获取npm镜像源
function getNpmRegistry() {
    return 'https://registry.npmmirror.com';
}
// 获取npm包信息
function getNpmInfo(packageName) {
    return __awaiter(this, void 0, void 0, function* () {
        const registry = getNpmRegistry();
        const npmUrl = url(registry, packageName);
        try {
            const res = yield axios.get(npmUrl);
            if (res.status === 200) {
                return res.data;
            }
        }
        catch (e) {
            return Promise.reject(e);
        }
    });
}
// 获取最新版本
function getLatestVersion(packageName) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getNpmInfo(packageName);
        if (!data)
            return null;
        return data['dist-tags'].latest;
    });
}
// 获取所有版本
function getVersion(packageName) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getNpmInfo(packageName);
        if (!data)
            return null;
        return Object.keys(data.versions);
    });
}
export { getLatestVersion, getNpmInfo, getNpmRegistry, getVersion };
//# sourceMappingURL=versionUtils.js.map