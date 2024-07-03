# quick test
```
node api.js
```

# first run (ubuntu)

install node
```bash
sudo apt install nodejs
sudo apt install npm
```
install dependencies
```bash
sudo -i

npm install express
npm install cors
npm install multer
```

run
```bash
node api.js
```

# normal run 
use screen
```bash
screen -S webPasteApi
cd /var/www/html/webclipboard/my-api
node api.js
```

# API
Get
```
http://127.0.0.1:3000/api/readfile/{any.txt}
```


Post
```
http://127.0.0.1:3000/api/writefile/{any.txt}
```
Post body (json)
```
{
  "content": "这是要写入文件的内容。"
}
```

## docker build 
```
docker build -t kasusa/webclipboard-v2.0:20240703 .
docker run -d -p 8000:3000  kasusa/webclipboard-v2.0
docker push kasusa/webclipboard-v2.0:20240703
```