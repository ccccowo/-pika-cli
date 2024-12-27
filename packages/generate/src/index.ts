import { input} from '@inquirer/prompts';
import path from 'node:path';
import OpenAI from 'openai';
import fse from 'fs-extra';
import {remark} from 'remark'
import ora from 'ora';
import { cosmiconfig } from 'cosmiconfig';
import { ConfigOptions } from './configType.js';

async function generate() {
    const explorer = cosmiconfig("generate");

    const result = await explorer.search(process.cwd());

    if(!result?.config) {
        console.error('没找到配置文件 generate.config.js');
        process.exit(1);
    }
    
    const config: ConfigOptions = result.config;

    const client = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
    });
    
    const systemContent = config.systemSetting

    let componentDir = '';
    while(!componentDir) {
        componentDir = await input({ message: '生成组件的目录', default: 'src/components' });
    }

    let componentDesc = '';
    while(!componentDesc) {
        componentDesc = await input({ message: '组件描述', default: '生成一个 Table 的 React 组件，有包含 name、age、email 属性的 data 数组参数' });
    }
    
    const spinner = ora('AI 生成代码中...').start();

    const res = await client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {role: 'system', content: systemContent},
          {role: 'user', content: componentDesc}
        ]
    });

    spinner.stop();

    const markdown = res.choices[0].message.content || '';
    
    await remark().use(function(...args) {
        return function(tree: any) {
            let curPath = '';
    
            for(let i = 0; i< tree.children.length; i++ ) {
                const node = tree.children[i];
                if(node.type === 'heading') {
                    curPath = path.join(componentDir, node.children[0].value);
                } else {
                    try {
                        fse.ensureFileSync(curPath);
                        fse.writeFileSync(curPath, node.value);
        
                        console.log('文件创建成功：', curPath)
                    } catch(e) {
                    }
                }
            }
    
        }
    }).process(markdown);
}

// generate();

export default generate;
