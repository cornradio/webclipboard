

# docker

[dockerhub](https://hub.docker.com/r/kasusa/webclipboard-v2.0)

## 简单部署
```shell
docker run -dp 8080:3000 kasusa/webclipboard-v2.0
# 可选国内镜像(更新不定期,可能有延后)
registry.cn-hangzhou.aliyuncs.com/aaas-images/webclipboard-v2.0
```

浏览器访问 `http://<服务器ip>:8080` 即可使用webclip  
如果需要自行编译其他架构： 请进入 `allnode_version\` 文件夹 ，装好node后执行 `docker build .`

## 自定义data位置部署

```SH
# 创建目录用于存放数据,方便以后升级
mkdir -p /home/webclipboard/txts /home/webclipboard/imgs

# 可以自行放置一个 imgs/bg/bg.jpg 会被用来当做images功能的背景图片
docker run -d -p 8080:3000 \
-v /home/webclipboard/txts:/home/node/app/public/txts \
-v /home/webclipboard/imgs:/home/node/app/public/images \
kasusa/webclipboard-v2.0
```

浏览器访问 `http://<服务器ip>:8080` 即可使用webclip


## 本地部署
下载 [tar包](https://github.com/cornradio/webclipboard/blob/main/allnode_version/webclipboard_v2.tar)，本地加载tar包，加载后可以使用上述方法之一部署
```shell
docker load -i webclipboard.tar
```
