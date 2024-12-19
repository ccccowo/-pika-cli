import axios from 'axios'
import url from 'url-join'

// 获取npm镜像源
function getNpmRegistry() {
    return 'https://registry.npmmirror.com'
}

// 获取npm包信息
async function getNpmInfo(packageName: string) {
    const registry = getNpmRegistry()
    const npmUrl = url(registry, packageName)
    try{
        const res = await axios.get(npmUrl)
        if(res.status === 200){
            return res.data
        }
    }catch(e){
        return Promise.reject(e)
    }
}

// 获取最新版本
async function getLatestVersion(packageName: string) {
    const data = await getNpmInfo(packageName)
    if(!data) return null
    return data['dist-tags'].latest
}

// 获取所有版本
async function getVersion(packageName: string) {
    const data = await getNpmInfo(packageName)
    if(!data) return null
    return Object.keys(data.versions)
}

export {
    getLatestVersion,
    getNpmInfo,
    getNpmRegistry,
    getVersion
}