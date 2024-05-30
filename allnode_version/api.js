const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors()); // 允许跨域请求
const port = 3000;

const filemanager = require('./filemanager');
const filter = require('./filter');

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 定义路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/api/readfile/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    // 检查文件名是否合法
    let result = filter.check(fileName);
    if(result=='ok'){
        // 读取文件内容
        var time = new Date().toLocaleString();
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip = ip.replace('::ffff:', '');
        console.log(`${time} ${ip} Reading file ${fileName}...`);
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
        var time = new Date().toLocaleString();
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip = ip.replace('::ffff:', '');
        console.log(`${time} ${ip} Writing file ${fileName}...`);
        filemanager.writeFile(fileName, content);
        // 写入文件内容
        res.send('OK');
    }else{
        res.status(400).send(result);
    }
});
  
// 启动服务器
app.listen(port,() => {
  console.log(`Server is running on port ${port}`);
});