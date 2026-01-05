# WebClipboard Cloudflare Workers 版本

使用Cloudflare部署可以使用它免费的R2额度，以及worker能力，完成无服务器图床搭建。  
这个版本和主线版本不同，它优化了图床能力以及相关的权限控制。

- [部署](#部署)
- [使用](#使用)


## 优势
- **HTTPS**: 自动拥有域名和 SSL 证书。
- **免维护**: 不需要服务器，不需要控制容器。
- **图床优化**: 已经内置了 Referrer 策略和跨域策略、以及更多的权限控制。


# 部署
嗯你需要首先下载本项目，然后参考下列步骤进行部署。

## 准备工作
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 在左侧菜单找到 **R2**，点击 **Create bucket**。
3. 创建一个名为 `webclipboard-storage` 的桶（如果你改了名字，请同步修改 `wrangler.toml`）。

## 部署步骤
1. 打开终端，进入 `cf_version` 目录。
2. 安装依赖：`npm install`
3. 登录 CF：`npx wrangler login`
4. 部署：`npx wrangler deploy`


---

## 如何上传界面 (HTML) —— 重点说明
因为 Cloudflare Workers 没有硬盘，所以你的 `index.html` 和图片不能直接“部署”，而是要存进 **R2 存储桶**。

如果你现在打开上面的网址显示 `Not Found`，说明你还没上传网页文件。

### 快捷上传方案 (使用命令行)
在 `cf_version` 目录下运行以下 PowerShell 命令，我会自动帮你把文件推送到 R2：

```powershell
# 上传主页
npx wrangler r2 object put webclipboard-storage/public/index.html --file=../allnode_version/public/index.html

# 上传图片面板页
npx wrangler r2 object put webclipboard-storage/public/t2.html --file=../allnode_version/public/t2.html

# 上传图标
npx wrangler r2 object put webclipboard-storage/public/icon.png --file=../allnode_version/public/icon.png
```

### 手动上传方案 (使用网页)
1. 登录 CF 官网，进入 **R2** -> **webclipboard-storage**。
2. 点击 **Upload**。
3. **关键点**：CF 网页端通常不支持直接设置路径。如果你的文件名是 `index.html`，Worker 会去找 `public/index.html`。
   * **强烈建议使用上面的命令行方式**，因为它能精准指定 `public/` 这个前缀。

---

# 使用
**部署成功后的访问地址：**
[https://webclipboard-cf.<username>.workers.dev](https://webclipboard-cf.<username>.workers.dev)

同时推荐使用我的另一个项目：[ahkshortcut](https://github.com/cornradio/ahkshortcut) ,它可以使用快捷键打开自定义链接。

## 使用

1. 首先进入t2页面（首页点击右侧的 Images），这里是你的图床。
2. 入一个box，在文本框中输入 mine_tuchuang ，然后点击 GO。
3. 点击右上角 permission 按钮，设置权限，增加一个密码。
4. 点击右上角 Use Scope 按钮，这里是防盗链设置，采用白名单策略，只有你允许的域名才可以访问这个图床的图片。 

5. （可选）进入 bg box，可以上传一个bg.jpg,他会变成你的图床网站背景图片。
6. （可选）左上角有一个 auto comppress 开关，开启后，上传的图片会自动压缩，使用前端算法实现，你可以点击图片查看大图，下方会显示图片的大小。
7. （可选）左上角有一个 quick delete 开关，开启后，可以连续的点击图片的删除按钮，而不需要有确认窗口。


关于权限：
> - 每个 box 使用单独的密码,但是你使用一个新 box 的时候,如果他不是第一个,那么你需要输入第一个 box 的密码来创建新密码。  
> - 你的密码会在你的 bucket 里面显示为一个文件，如果你忘记了，可以去 bucket 中查看。
> - 密码会自动保存到你的localStorage中，这样你就不需要每次输入密码了。

关于box：
> - box 可以简单理解成文件夹，这个图窗支持很多个文件夹，每个文件夹都是独立的，
> - 如果有一个 box 你没有设置过密码，那么任何人都可以在这个box上传或下载，但是由于防盗链的限制，它并不能用作其他地方的图床。
> - 如果你设置过box的密码，那么只有你设置的密码才能修改这个box，比如说上传图片或者删除图片。

关于防盗链：
> - 防盗链是通过白名单策略实现的，你可以在 Use Scope 中设置允许的域名，只有这些域名才能访问你的图床的图片。（所以有的时候他甚至会把自己也拦截掉，导致你看不到图片）
> - 你也可以关闭防盗链功能这样它就是一个任何网站都可以使用的图床。