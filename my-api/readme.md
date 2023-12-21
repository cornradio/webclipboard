# first run

install node
```bash
sudo apt install nodejs
```
install dependencies
```bash
npm install express
npm install cors
```

run
```bash
node api.js
```

# normal run 
use screen
```bash
screen -S webPasteApi
node api.js
```

# api
Get
```
http://127.0.0.1:3000/api/readfile/{any.txt}
```


Post
```
http://127.0.0.1:3000/api/writefile/{any.txt}
```
Post body
```
{
  "content": "这是要写入文件的内容。"
}
```