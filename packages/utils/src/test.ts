import NpmPackage from './NpmPackage.js';
import path from 'node:path';

async function main() { 
    const pkg = new NpmPackage({
        targetPath: path.join(import.meta.dirname, '../aaa'),
        name: 'create-vite'
    });

    if(await pkg.exists()) {
        pkg.update();
    } else {
        pkg.install();
    }

    console.log(await pkg.getPackageJSON())
}

main();
