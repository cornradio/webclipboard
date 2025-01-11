const fs = require('fs');

function readFile(filename) {
  if (fs.existsSync(filename)) {
    return fs.readFileSync(filename, 'utf8');
  } else {
    console.log(`文件 ${filename} 不存在`);
    return 'file not found';
  }
}

function createFile(filename) {
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, '');
    console.log(`文件 ${filename} 已创建`);
  } else {
    console.log(`文件 ${filename} 已存在，无需创建`);
  }
}

function writeFile(filename, content) {
  // 如果文件夹不存在，则创建它
  const path = require('path');
  const folderPath = path.dirname(filename);
  if (!fs.existsSync(folderPath)) {
    try {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`文件夹 ${folderPath} 已创建`);
    } catch (err) {
      console.error(`创建文件夹 ${folderPath} 时出错: ${err.message}`);
      throw err; // 或者根据需要处理错误
    }
  }
  fs.writeFileSync(filename, content);
  console.log(`内容已成功写入文件 ${filename}`);
}

// const filename = '1.txt';
// const content = 'Hello World again!';
// writeFile(filename, content);
// console.log(content);


exports.readFile = readFile;
exports.writeFile = writeFile;