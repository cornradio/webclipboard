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
  fs.writeFileSync(filename, content);
  console.log(`内容已成功写入文件 ${filename}`);
}

// const filename = '1.txt';
// const content = 'Hello World again!';
// writeFile(filename, content);
// console.log(content);


exports.readFile = readFile;
exports.writeFile = writeFile;