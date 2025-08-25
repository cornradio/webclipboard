

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
cd /home/webclipboard/allnode_version
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
docker build -t kasusa/webclipboard-v2.0:20250825 .
docker run -d -p 80:3000  kasusa/webclipboard-v2.0:20250825
docker push kasusa/webclipboard-v2.0:20250825
docker tag kasusa/webclipboard-v2.0:20250825 kasusa/webclipboard-v2.0:latest
docker push kasusa/webclipboard-v2.0:latest
```

## docker save to file
```
docker save -o webclipboard.tar kasusa/webclipboard-v2.0:20250111
docker load -i webclipboard.tar
```

## docker run 
可以使用 -v 参数来挂载本地目录到容器中 ， 这样即使更新版本，也会保留文件  
并且更方便从外部查看和修改

```
docker run -d -p 8000:3000 `
    -v "C:\Users\Admin\Downloads\test\txt:/home/node/app/public/txts" `
    -v "C:\Users\Admin\Downloads\test\img:/home/node/app/public/images" `
    kasusa/webclipboard-v2.0:20250111
```
