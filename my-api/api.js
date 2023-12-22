const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors()); // 允许跨域请求
const port = 3000;

const filemanager = require('./filemanager');
const filter = require('./filter');

app.get('/api/readfile/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    // 检查文件名是否合法
    let result = filter.check(fileName);
    if(result=='ok'){
        // 读取文件内容
        console.log(`Reading file ${fileName}...`);
        const content = filemanager.readFile(fileName);
        res.send(content);
    }else{
        res.status(400).send(result);
    }
});

app.use(express.json());
app.post('/api/writefile/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const content = req.body.content; // 从请求体中获取content参数
  
    let result = filter.check(fileName);
    if(result=='ok'){
        // 读取文件内容
        filemanager.writeFile(fileName, content);
        // 写入文件内容
        res.send('OK');
    }else{
        res.status(400).send(result);
    }
});
  
// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});