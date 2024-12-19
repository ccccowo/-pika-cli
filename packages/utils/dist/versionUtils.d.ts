declare function getNpmRegistry(): string;
declare function getNpmInfo(packageName: string): Promise<any>;
declare function getLatestVersion(packageName: string): Promise<any>;
declare function getVersion(packageName: string): Promise<string[] | null>;
export { getLatestVersion, getNpmInfo, getNpmRegistry, getVersion };
