## 在线剪切板
使用方法1(源码)：
1. git clone 本项目到服务器
2. 进入 `allnode_version/` 目录下
3. 安装 node 环境 
4. 执行 `npm install` 安装依赖
3. 使用命令 `node api.js` 启动服务
4. 访问 `http://<你的服务器ip>:3000` 即可使用剪切版

```SH
#!/bin/bash
# 1. git clone 本项目到服务器
git clone https://github.com/cornradio/webclipboard

# 进入 `allnode_version/` 目录下
cd webclipboard/allnode_version

# 检查 Node.js 是否已经安装
if ! command -v node &> /dev/null; then
    echo "Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 4. 执行 `npm install` 安装依赖
npm install

# 5. 使用命令 `node api.js` 启动服务
node api.js &  # 使用 & 让服务在后台运行

# 6. 访问 `http://<你的服务器ip>:3000` 即可使用剪切版
echo "服务已启动，请访问 http://<你的服务器ip>:3000 使用剪切版"
```

使用方法2(docker)：  
参考本文底部的 [docker部署章节](#docker)  
❗注意目前 docker 版本数据都存在 docker 内部，升级时不能保存历史数据文件...


## 截图
![1](images/image.png)
<div align="center">
	<img src="images/image2.jpg" alt="Editor" width="500">
</div>

![图片上传功能](https://raw.githubusercontent.com/cornradio/imgs/main/blog/Clip_2024-07-17_19-45-13.png)

## 历史记录功能
- 使用 `localStorage` 保存本地访问过的文件名历史记录
- 通过鼠标移动到网页左上角的方式查看历史记录
![历史记录](https://raw.githubusercontent.com/cornradio/imgs/main/blog/Clip_2024-07-17_19-47-01.png)

# docker

## docker 一键部署 (从dockerhub下载)
[dockerhub](https://hub.docker.com/r/kasusa/webclipboard-v2.0)

```shell
docker run -dp 80:3000 kasusa/webclipboard-v1.0
docker run -dp 80:3000 kasusa/webclipboard-v2.0
```
v1.0 和 v2.0 的区别：
kasusa/webclipboard-v2.0 增加了图片存储功能; v1.0 只有存储文字的功能。


浏览器访问 `http://<服务器ip>` 即可使用剪切版  
如果需要自行编译其他架构： 请进入 `allnode_version\` 文件夹 ，装好node后执行 `docker build .`

## docker 一键部署 (从阿里云容器服务下载)

```
# 创建目录 
mkdir -p /home/webclipboard/txts /home/webclipboard/imgs
# 可以自行放置一个 imgs/bg/bg.jpg 会被用来当做images功能的背景图片

docker run -d -p 88:3000 \
-v /home/webclipboard/txts:/home/node/app/public/txts \
-v /home/webclipboard/imgs:/home/node/app/public/images \
registry.cn-hangzhou.aliyuncs.com/aaas-images/webclipboard-v2.0:20240825v2
```

## linux 下使用（curl命令）

`uploadtxt.sh` 可以上传 `a.json` 文件到服务器 `1.txt` 文件中
```shell
curl \
-X POST http://<your-ip>/api/writefile/1.txt \
-H "Content-Type: application/json" \
-d "{\"content\": \"$(awk '{printf "%s\\n", $0}' a.json | sed 's/"/\\"/g')\"}"
```

## 类似tool
https://fagedongxi.com/  
https://getnote.top/  
https://hackmd.io/?nav=overview
