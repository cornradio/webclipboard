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

// 设置静态文件目录，并允许跨域（CORS）以及设置缓存，方便作为图床使用
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.set('Timing-Allow-Origin', '*');
        // 为图片设置长期缓存
        if (path.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
            res.set('Cache-Control', 'public, max-age=31536000');
        }
    }
}));

// 密码验证函数
function verifyPassword(boxname, providedPassword) {
    const passwordFile = path.join(__dirname, 'public', 'images', boxname, 'password.txt');
    if (fs.existsSync(passwordFile)) {
        const storedPassword = fs.readFileSync(passwordFile, 'utf8').trim();
        return storedPassword === providedPassword;
    }
    return true; // 如果没有密码文件，默认不需要密码
}

// 检查是否设置了密码
app.get('/api/hasPassword/:boxname', (req, res) => {
    const boxname = req.params.boxname;
    const passwordFile = path.join(__dirname, 'public', 'images', boxname, 'password.txt');
    res.send({ hasPassword: fs.existsSync(passwordFile) });
});

// 设置/修改密码
app.post('/api/setPassword/:boxname', express.json(), (req, res) => {
    const boxname = req.params.boxname;
    const { oldPassword, newPassword } = req.body;
    const folderPath = path.join(__dirname, 'public', 'images', boxname);
    const passwordFile = path.join(folderPath, 'password.txt');

    if (filter.checkimageboxname(boxname) !== 'ok') return res.status(403).send('非法名称');

    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    if (fs.existsSync(passwordFile)) {
        const storedPassword = fs.readFileSync(passwordFile, 'utf8').trim();
        if (storedPassword !== oldPassword) return res.status(401).send('原密码错误');
    }

    if (!newPassword || newPassword.trim() === '') {
        if (fs.existsSync(passwordFile)) fs.unlinkSync(passwordFile);
        res.send('Password removed');
    } else {
        fs.writeFileSync(passwordFile, newPassword.trim());
        res.send('Password set');
    }
});

// 定义路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/api/readfile/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    // 检查文件名是否合法
    let result = filter.check(fileName);
    // 拼接文件路径
    let filePath = path.join(__dirname, "public", 'txts', fileName);
    if (result == 'ok') {
        // 读取文件内容
        var time = new Date().toLocaleString();
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip = ip.replace('::ffff:', '');
        console.log(`${time} ${ip} Reading file ${fileName}...`);
        const content = filemanager.readFile(filePath);
        res.send(content);
    } else {
        res.status(400).send(result);
    }
});

app.use(express.json());
app.post('/api/writefile/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const content = req.body.content; // 从请求体中获取content参数
    // 拼接文件路径
    let filePath = path.join(__dirname, "public", 'txts', fileName);

    let result = filter.check(fileName);
    if (result == 'ok') {
        // 读取文件内容
        var time = new Date().toLocaleString();
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip = ip.replace('::ffff:', '');
        console.log(`${time} ${ip} Writing file ${fileName}...`);
        filemanager.writeFile(filePath, content);
        // 写入文件内容
        res.send('OK');
    } else {
        res.status(400).send(result);
    }
});



// 获取图片列表 
// response like ["a.png","b.png"]
app.get('/api/getImageList/:boxname', (req, res) => {
    const boxname = req.params.boxname;
    // 检查boxname是否合法
    let result = filter.checkimageboxname(boxname);

    if (result === 'ok') {
        const folderPath = path.join(__dirname, 'public', 'images', boxname);

        // Ensure the parent directories exist
        fs.mkdirSync(path.join(__dirname, 'public', 'images'), { recursive: true });

        if (fs.existsSync(folderPath)) {
            fs.readdir(folderPath, (err, files) => {
                if (err) {
                    console.error(`读取文件夹错误: ${err.message}`);
                    res.status(500).send('Internal Server Error');
                } else {
                    // 过滤掉密码文件
                    const filteredFiles = files.filter(f => f !== 'password.txt');
                    console.log(`文件夹 ${folderPath} 中的文件:`, filteredFiles);
                    res.send(filteredFiles);
                }
            });
        } else {
            console.log(`文件夹不存在，创建: ${folderPath}`);
            fs.mkdirSync(folderPath);
            res.send([]);
        }
    } else {
        console.log(`恶意访问尝试 - boxname: ${boxname}, 原因: ${result}`);
        res.status(403).send('禁止：' + result);
    }
});

//上传图片
// 设置存储上传文件的配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 获取原始的URL参数，避免Express自动解码
        const originalUrl = req.originalUrl || req.url;
        const boxnameMatch = originalUrl.match(/\/api\/uploadImage\/([^\/\?]+)/);
        const boxname = boxnameMatch ? boxnameMatch[1] : req.params.boxname;

        // 先验证boxname是否合法
        let result = filter.checkimageboxname(boxname);
        if (result !== 'ok') {
            return cb(new Error(result));
        }

        const folderPath = path.join(__dirname, 'public', 'images', boxname);
        // 如果文件夹不存在，创建它
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        // 验证文件名是否合法
        let filenameResult = filter.checkImageFilename(file.originalname);
        if (filenameResult !== 'ok') {
            return cb(new Error(filenameResult));
        }
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/api/uploadImage/:boxname', (req, res, next) => {
    const boxname = req.params.boxname;
    const password = req.headers['x-box-password'];
    if (!verifyPassword(boxname, password)) {
        return res.status(401).send('密码错误或需要密码');
    }
    next();
}, upload.array('image', 10), (req, res) => {
    const boxname = req.params.boxname;
    // 检查boxname是否合法
    let result = filter.checkimageboxname(boxname);
    if (result !== 'ok') {
        console.log(`恶意上传尝试 - boxname: ${boxname}, 原因: ${result}`);
        return res.status(403).send('禁止：' + result);
    }

    // 检查上传的文件名是否合法
    if (req.files && req.files.length > 0) {
        console.log(`上传了 ${req.files.length} 个文件:`);
        for (let file of req.files) {
            console.log(`- 文件名: ${file.originalname}`);
            console.log(`- 保存路径: ${file.path}`);
            console.log(`- 文件大小: ${file.size} bytes`);

            let filenameResult = filter.checkImageFilename(file.originalname);
            if (filenameResult !== 'ok') {
                console.log(`恶意文件上传尝试 - 文件名: ${file.originalname}, 原因: ${filenameResult}`);
                return res.status(403).send('禁止：' + filenameResult);
            }
        }
        res.status(200).send('scs');
    } else {
        res.status(400).send('未成功上传图片');
    }
});

// 删除图片
app.post('/api/deleteImage/:boxname/:filename', (req, res) => {
    const boxname = req.params.boxname;
    const filename = req.params.filename;
    const password = req.headers['x-box-password'];

    if (!verifyPassword(boxname, password)) {
        return res.status(401).send('密码错误');
    }

    // 检查boxname是否合法
    let result = filter.checkimageboxname(boxname);
    if (result !== 'ok') {
        console.log(`恶意删除尝试 - boxname: ${boxname}, 原因: ${result}`);
        return res.status(403).send('禁止：' + result);
    }

    // 检查文件名是否合法
    let filenameResult = filter.checkImageFilename(filename);
    if (filenameResult !== 'ok') {
        console.log(`恶意删除尝试 - filename: ${filename}, 原因: ${filenameResult}`);
        return res.status(403).send('禁止：' + filenameResult);
    }

    const folderPath = path.join(__dirname, 'public', 'images', boxname);
    const filePath = path.join(folderPath, filename);

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
    const boxname = req.params.boxname;
    const password = req.headers['x-box-password'];

    if (!verifyPassword(boxname, password)) {
        return res.status(401).send('密码错误');
    }

    // 检查boxname是否合法
    let result = filter.checkimageboxname(boxname);
    if (result !== 'ok') {
        console.log(`恶意清空尝试 - boxname: ${boxname}, 原因: ${result}`);
        return res.status(403).send('禁止：' + result);
    }

    const folderPath = path.join(__dirname, 'public', 'images', boxname);

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

// 处理multer错误
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('文件大小超出限制');
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).send('文件数量超出限制');
        }
        return res.status(400).send('文件上传错误: ' + error.message);
    }

    // 处理自定义验证错误（恶意上传）
    if (error.message) {
        console.log(`恶意上传被拦截: ${error.message}`);
        return res.status(403).send('禁止：' + error.message);
    }

    next(error);
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
