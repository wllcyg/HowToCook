const fs = require('fs');
const path = require('path');

// 要删除的文本
const textToRemove = '如果您遵循本指南的制作流程而发现有问题或可以改进的流程，请提出 Issue 或 Pull request 。';

// 统计信息
let processedCount = 0;
let modifiedCount = 0;

/**
 * 递归遍历目录中的所有文件
 * @param {string} directory - 要遍历的目录路径
 */
function traverseDirectory(directory) {
  // 读取目录内容
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 如果是目录，递归遍历
      traverseDirectory(fullPath);
    } else if (stat.isFile() && path.extname(fullPath) === '.md') {
      // 如果是 Markdown 文件，处理内容
      processMarkdownFile(fullPath);
    }
  }
}

/**
 * 处理 Markdown 文件
 * @param {string} filePath - 文件路径
 */
function processMarkdownFile(filePath) {
  processedCount++;

  try {
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');

    // 检查文件内容是否包含要删除的文本
    if (content.includes(textToRemove)) {
      // 删除指定文本
      const newContent = content.replace(textToRemove, '');

      // 写回文件
      fs.writeFileSync(filePath, newContent, 'utf8');

      modifiedCount++;
      console.log(`已修改: ${filePath}`);
    }
  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error);
  }
}

// 开始处理，从当前目录开始
const currentDirectory = process.cwd();
console.log(`开始处理目录: ${currentDirectory}`);

traverseDirectory(currentDirectory);

console.log(`处理完成！共处理 ${processedCount} 个文件，修改了 ${modifiedCount} 个文件。`);
