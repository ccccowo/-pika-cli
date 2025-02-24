interface CreateOptions {
    template?: string;
    name?: string;
    targetPath?: string;
}
declare function create(options?: CreateOptions): Promise<{
    path: string;
}>;
export default create;
