import {select ,input} from '@inquirer/prompts'

async function create() {
    const projectTemplate = await select({
        message: '请选择项目模板',
        choices:[
            {
                name:'组件库 项目(vue3)',
                value:'@pika-cli/template-component-vue3'
            },
            {
                name:'组件库 项目(react)',
                value:'@pika-cli/template-component-react'
            }
        ]
    })
    let projectName = ''
    while(projectName === ''){
        projectName = await input({
            message:'请输入项目名称',
            validate: (input:string) => input.length > 0 ? true : '项目名称不能为空'
        })
    }
}
create()
export default create;

