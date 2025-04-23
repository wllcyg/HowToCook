const fs = require('fs');
const path = require('path');

// 定义需要替换的前缀和替换后的前缀
const OLD_PREFIX = 'https://assets-wl001.oss-cn-beijing.aliyuncs.com/images';
const NEW_PREFIX = 'https://assets-wl001.oss-cn-beijing.aliyuncs.com/images/images/';

// 统计信息
let processedFiles = 0;
let modifiedFiles = 0;
let replacedImages = 0;

/**
 * 递归遍历目录中的所有Markdown文件
 * @param {string} directory - 要遍历的目录路径
 */
function traverseDirectory(directory) {
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 递归处理子目录
      traverseDirectory(fullPath);
    } else if (stat.isFile() && path.extname(fullPath).toLowerCase() === '.md') {
      // 处理Markdown文件
      processMarkdownFile(fullPath);
    }
  }
}

/**
 * 处理单个Markdown文件
 * @param {string} filePath - 文件路径
 */
function processMarkdownFile(filePath) {
  processedFiles++;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileModified = false;

  // 匹配Markdown图片语法: ![alt](url)
  const mdImageRegex = /!\[(.*?)\]\((https?:\/\/[^)]+)\)/g;
  content = content.replace(mdImageRegex, (match, alt, url) => {
    if (url.startsWith(OLD_PREFIX)) {
      // 提取OLD_PREFIX之后的部分
      const imagePath = url.substring(OLD_PREFIX.length);
      // 构建新URL，确保路径结构正确
      const newUrl = `${NEW_PREFIX}${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
      replacedImages++;
      fileModified = true;
      return `![${alt}](${newUrl})`;
    }
    return match;
  });

  // 匹配HTML图片语法: <img src="url" ... >
  const htmlImageRegex = /<img\s+[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/g;
  content = content.replace(htmlImageRegex, (match, url) => {
    if (url.startsWith(OLD_PREFIX)) {
      // 提取OLD_PREFIX之后的部分
      const imagePath = url.substring(OLD_PREFIX.length);
      // 构建新URL，确保路径结构正确
      const newUrl = `${NEW_PREFIX}${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
      replacedImages++;
      fileModified = true;
      return match.replace(url, newUrl);
    }
    return match;
  });

  // 如果文件内容有变化，写回文件
  if (fileModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles++;
    console.log(`已修改文件: ${filePath}`);
  }
}

// 主函数
function main() {
  console.log('开始替换OSS图片路径...');
  console.log(`将替换: ${OLD_PREFIX}`);
  console.log(`替换为: ${NEW_PREFIX}`);

  // 从当前目录开始遍历
  const startDir = process.cwd();
  traverseDirectory(startDir);

  console.log(`
处理完成！
- 总共处理 ${processedFiles} 个Markdown文件
- 修改了 ${modifiedFiles} 个文件
- 替换了 ${replacedImages} 个图片路径
`);
}

// 执行主函数
main();
