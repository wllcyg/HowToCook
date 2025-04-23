const fs = require('fs');
const path = require('path');

// 配置路径
const dishesDir = path.join(__dirname, 'dishes');
const imagesDir = path.join(__dirname, 'images');

// 确保 images 目录存在
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`创建目录: ${imagesDir}`);
}

// 存储已处理的目录，用于后续删除
const processedDirs = new Set();

// 图片文件扩展名
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];

// 递归遍历目录，处理所有图片文件
function processDirectory(dirPath) {
  // 读取目录内容
  const items = fs.readdirSync(dirPath);
  let hasNonImageFiles = false;

  // 遍历目录中的所有项目
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 如果是目录，递归处理
      processDirectory(fullPath);
      // 记录处理过的目录
      processedDirs.add(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath).toLowerCase();

      if (imageExtensions.includes(ext)) {
        // 如果是图片文件，移动到 images 目录
        const newPath = path.join(imagesDir, item);

        // 如果目标文件已存在，重命名文件
        let finalPath = newPath;
        let counter = 1;
        while (fs.existsSync(finalPath)) {
          const nameParts = path.parse(newPath);
          finalPath = path.join(
            nameParts.dir,
            `${nameParts.name}_${counter}${nameParts.ext}`
          );
          counter++;
        }

        // 移动文件
        fs.copyFileSync(fullPath, finalPath);
        fs.unlinkSync(fullPath); // 删除原文件
        console.log(`移动图片: ${fullPath} -> ${finalPath}`);
      } else {
        // 记录目录中是否有非图片文件
        hasNonImageFiles = true;
      }
    }
  }

  // 记录这个目录是否只包含图片
  if (!hasNonImageFiles) {
    processedDirs.add(dirPath);
  }
}

// 删除已处理的空目录
function removeEmptyDirectories() {
  // 将目录按照深度排序（子目录先删除）
  const dirsToRemove = Array.from(processedDirs).sort((a, b) => {
    return b.split(path.sep).length - a.split(path.sep).length;
  });

  for (const dir of dirsToRemove) {
    try {
      // 检查目录是否为空
      const items = fs.readdirSync(dir);
      if (items.length === 0) {
        fs.rmdirSync(dir);
        console.log(`删除空目录: ${dir}`);
      }
    } catch (error) {
      console.error(`无法删除目录 ${dir}: ${error.message}`);
    }
  }
}

// 主函数
function main() {
  console.log('开始处理图片文件...');

  // 处理 dishes 目录下的所有文件
  processDirectory(dishesDir);

  // 删除空目录
  removeEmptyDirectories();

  console.log('处理完成！');
}

// 执行主函数
main();
