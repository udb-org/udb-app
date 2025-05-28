const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { pipeline } = require('stream/promises');

// 配置参数
const owner = 'udb-org';      // 例如：google
const repo = 'udb-java';         // 例如：guava
const fileNamePattern = /.+\.jar$/; // 匹配JAR文件的正则表达式

export async function getLatestRelease(serverJarPath:any) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  
  try {
    // 获取最新Release信息
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Node.js download script',
        // 如果需要访问私有仓库，可添加token：
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    });

    const release = response.data;
    console.log(`找到最新版本: ${release.tag_name}`);

    // 查找符合条件的asset
    const targetAsset = release.assets.find(asset => 
      fileNamePattern.test(asset.name)
    );

    if (!targetAsset) {
      throw new Error('未找到符合条件的JAR文件');
    }

    console.log(`发现文件: ${targetAsset.name} (${formatBytes(targetAsset.size)})`);

    // 下载文件
    const outputPath =serverJarPath;
    console.log(`下载到: ${serverJarPath}`);
    const writer = fs.createWriteStream(outputPath);
    
    console.log('开始下载...');
    const downloadResponse = await axios({
      method: 'get',
      url: targetAsset.browser_download_url,
      responseType: 'stream'
    });

    await pipeline(downloadResponse.data, writer);
    console.log(`下载完成！保存路径: ${outputPath}`);

  } catch (error) {
    console.error('发生错误:', error.message);
    if (error.response) {
      console.error(`API响应状态: ${error.response.status}`, error.response.data);
    }
    throw error;
  }
}

// 辅助函数：格式化字节大小
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}