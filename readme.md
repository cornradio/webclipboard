## 在线剪切板
使用方法1(使用源码)：
1. git clone 本项目到服务器的 nginx 目录下 （如 /var/www/html）
2. 进入 `allnode_version/` 目录下，执行 按照 readme.md 中的步骤安装依赖
3. 使用命令 `node api.js` 启动服务
4. 访问 `http://<你的服务器ip>:3000` 即可

使用方法2(docker部署)：  
参考本文底部的 [docker部署章节](#docker-一键部署)  
❗注意目前 docker 版本数据都存在 docker 内部，升级时不能保存历史数据文件...

体验一下：  
https://pasteboard.online/  
体验的功能不一定是最新的  
并且为了你自己的数据安全，建议自己搭建使用

## 截图
![1](images/image.png)
<div align="center">
	<img src="images/image2.jpg" alt="Editor" width="500">
</div>

![图片上传功能](https://raw.githubusercontent.com/cornradio/imgs/main/blog/Clip_2024-07-17_19-45-13.png)

## 历史记录功能
- 本项目使用 `localStorage` 保存本地访问过的文件名历史记录，不会保存在服务器上
![历史记录](https://raw.githubusercontent.com/cornradio/imgs/main/blog/Clip_2024-07-17_19-47-01.png)

## docker 一键部署
[dockerhub](https://hub.docker.com/r/kasusa/webclipboard-v2.0)


```shell
docker run -dp 80:3000 kasusa/webclipboard-v1.0
docker run -dp 80:3000 kasusa/webclipboard-v2.0
```
v1.0 和 v2.0 的区别：
kasusa/webclipboard-v2.0 增加了图片存储功能，位于子页面中。
v1.0 要更精简一点,只有存储文字的功能。

浏览器访问 `http://<服务器ip>` 即可使用剪切版  
如果需要自行编译其他架构： 请进入 `allnode_version\` 文件夹 ，装好node后执行 `docker build .`

## docker(从加速服务器下载)

删除旧版
```
docker ps
docker stop 581692fb47c6
docker rmi -f registry.cn-hangzhou.aliyuncs.com/aaas-images/webclipboard-v2.0:202407032
```

下载新版并运行
```
docker pull registry.cn-hangzhou.aliyuncs.com/aaas-images/webclipboard-v2.0:20240825v2
docker image ls
docker run -d -p 88:3000  registry.cn-hangzhou.aliyuncs.com/aaas-images/webclipboard-v2.0:20240825v2
```

挂载本地目录到容器中，这样即使更新版本，也会保留文件
下面命令以 Linux 作为演示
```
# 创建目录 
mkdir -p /home/webclipboard/txts /home/webclipboard/imgs
# 可以自行放置一个 imgs/bg/bg.jpg 会被用来当做images功能的背景图片

docker run -d -p 88:3000 \
-v /home/webclipboard/txts:/home/node/app/public/txts \
-v /home/imgs:/home/node/app/public/images \
registry.cn-hangzhou.aliyuncs.com/aaas-images/webclipboard-v2.0:20240825v2
```