const express = require('express');
const app = express();
const port = 3000;

const filemanager = require('./filemanager');

app.get('/api/readfile/:fileName', (req, res) => {
    const fileName = req.params.fileName;
  
    // 检查文件扩展名是否为.txt
    if (!fileName.endsWith('.txt')) {
      return res.status(400).send('Invalid file format. Only .txt files are allowed.');
    }
    if (fileName.startsWith('.')) {
      return res.status(400).send('Invalid file name. File name cannot start with "."');
    }

    // 读取文件内容
    const content = filemanager.readFile(fileName);
    res.send(content);
});

app.use(express.json());
app.post('/api/writefile/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const content = req.body.content; // 从请求体中获取content参数
  
    // 检查文件扩展名是否为.txt
    if (!fileName.endsWith('.txt')) {
      return res.status(400).send('Invalid file format. Only .txt files are allowed.');
    }
    if (fileName.startsWith('.')) {
      return res.status(400).send('Invalid file name. File name cannot start with "."');
    }
  
    // 写入文件内容
    filemanager.writeFile(fileName, content);
    res.send('OK');
});
  
// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});