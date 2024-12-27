var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cosmiconfig } from 'cosmiconfig';
import path from 'node:path';
const explorer = cosmiconfig("xxx");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield explorer.search(path.join(import.meta.dirname, '../'));
        console.log(result === null || result === void 0 ? void 0 : result.config);
    });
}
main();
//# sourceMappingURL=test.js.map