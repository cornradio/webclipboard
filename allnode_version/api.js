const fs = require('fs');
const path = require('path');
const multer = require('multer');
const express = require('express');
const cors = require('cors');
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

// 获取图片列表 
// response like ["a.png","b.png"]
app.get('/api/getImageList/:boxname', (req, res) => {
    const fileName = req.params.boxname;
    // 检查boxname是否合法
    let result = filter.checkimageboxname(fileName);
    
    if (result === 'ok') {
        const folderPath = path.join('public', 'images', fileName);

        // Ensure the parent directories exist
        fs.mkdirSync(path.join('public', 'images'), { recursive: true });

        if (fs.existsSync(folderPath)) {
            fs.readdir(folderPath, (err, files) => {
                if (err) {
                    res.status(500).send('Internal Server Error');
                } else {
                    res.send(files);
                }
            });
        } else {
            fs.mkdirSync(folderPath);
            res.send([]);
        }
    } else {
        res.status(400).send(result);
    }
});

//上传图片
// 设置存储上传文件的配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderPath = path.join(__dirname, 'public', 'images', req.params.boxname);
        // 如果文件夹不存在，创建它
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/api/uploadImage/:boxname', upload.array('image', 10), (req, res) => { 
    if (req.files && req.files.length > 0) {
        res.status(200).send('图片上传成功');
    } else {
        res.status(400).send('未成功上传图片');
    }
});


// 删除图片
app.post('/api/deleteImage/:boxname/:filename', (req, res) => {
    const folderPath = path.join(__dirname, 'public', 'images', req.params.boxname);
    const filePath = path.join(folderPath, req.params.filename);

    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
        // 删除文件
        fs.unlink(filePath, (err) => {
            if (err) {
                res.status(500).send('Error deleting the image');
            } else {
                res.send('Image deleted successfully');
            }
        });
    } else {
        res.status(404).send('Image not found');
    }
});

// 删除imagebox
app.post('/api/clearBox/:boxname', (req, res) => {
    const folderPath = path.join(__dirname, 'public', 'images', req.params.boxname);

    // 检查文件夹是否存在
    if (fs.existsSync(folderPath)) {
        // 读取文件夹内容
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                return res.status(500).send('Error reading the folder');
            }

            // 删除每个文件
            files.forEach(file => {
                const filePath = path.join(folderPath, file);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Error deleting file ${filePath}`);
                    }
                });
            });

            // 删除文件夹
            fs.rmdir(folderPath, { recursive: true }, (err) => {
                if (err) {
                    return res.status(500).send('Error deleting the folder');
                }
                res.send('Folder cleared successfully');
            });
        });
    } else {
        res.status(404).send('Folder not found');
    }
});


// 启动服务器
app.listen(port,() => {
  console.log(`Server is running on port ${port}`);
});
