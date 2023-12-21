# how to run

insatll node
```bash
sudo apt install nodejs
```
install dependencies
```bash
npm install express
```

run
```bash
node api.js
```

## how to use use api
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