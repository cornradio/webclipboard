## 在线剪切板
使用方法：
1. git clone 本项目到服务器的 nginx 目录下 （如 /var/www/html）
2. 按照 [api-readme](/my-api/readme.md) 启动 `nodejs` api服务器，会使用3000端口

## 截图
![1](images/image.png)
<div align="center">
	<img src="images/image2.jpg" alt="Editor" width="500">
</div>

## 历史记录功能
- 本项目使用 `localStorage` 保存本地访问过的文件名历史记录，不会保存在服务器上
![查看历史记录](https://img2.imgtp.com/2024/03/26/oe6DXGzI.gif)

## docker 一键部署

x64
```shell
docker run -dp 80:3000 kasusa/webclipboard-v1.0
docker run -dp 80:3000 kasusa/webclipboard-v2.0
```

浏览器访问 `http://<服务器ip>` 即可使用剪切版  
如果需要自行编译其他架构： 请进入 `allnode_version\` 文件夹 ，装好node后执行 `docker build .`
