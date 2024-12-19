export interface NpmPackageOptions {
    name: string;
    targetPath: string;
}
declare class NpmPackage {
    name: string;
    version: string;
    targetPath: string;
    storePath: string;
    constructor(options: NpmPackageOptions);
    prepare(): Promise<void>;
    install(): Promise<any>;
    get npmFilePath(): string;
    exists(): Promise<boolean>;
    getPackageJSON(): Promise<any>;
    update(): Promise<any>;
}
export default NpmPackage;
