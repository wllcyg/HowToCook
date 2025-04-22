/**
 * 脚本功能：将所有子目录中的Markdown文件移动到当前目录
 * 使用方法：在目标目录中运行 node 此脚本文件名.js
 */

const fs = require('fs');
const path = require('path');

// 获取当前目录
const currentDir = process.cwd();

// 递归查找所有子目录中的MD文件
function findMdFiles(directory) {
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);
    
    // 如果是目录，则递归查找
    if (stats.isDirectory()) {
      findMdFiles(itemPath);
    } 
    // 如果是MD文件，则移动到当前目录
    else if (stats.isFile() && path.extname(item).toLowerCase() === '.md') {
      if (directory !== currentDir) {
        const targetPath = path.join(currentDir, item);
        
        // 处理同名文件
        if (fs.existsSync(targetPath)) {
          const filename = path.basename(item, '.md');
          const extension = path.extname(item);
          // 添加相对路径作为前缀，替换路径分隔符为下划线，以避免文件名冲突
          const relativeDir = directory.replace(currentDir, '').substring(1).replace(/[\/\\]/g, '_');
          const newFilename = relativeDir ? `${relativeDir}_${filename}${extension}` : `${filename}_duplicate${extension}`;
          const newTargetPath = path.join(currentDir, newFilename);
          
          console.log(`发现同名文件，重命名为: ${newFilename}`);
          fs.renameSync(itemPath, newTargetPath);
        } else {
          console.log(`移动文件: ${itemPath} -> ${targetPath}`);
          fs.renameSync(itemPath, targetPath);
        }
      }
    }
  }
}

try {
  console.log('开始搜索并移动MD文件...');
  findMdFiles(currentDir);
  console.log('所有MD文件已移动到当前目录');
} catch (error) {
  console.error('发生错误:', error);
}