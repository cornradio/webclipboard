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