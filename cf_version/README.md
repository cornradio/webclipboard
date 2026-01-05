# WebClipboard Cloudflare Workers 版本

这个版本将你的应用迁移到了 Cloudflare 生态系统，完美解决了国内服务器没备案导致的 HTTPS/SSL 证书问题。

## 优势
- **HTTPS**: 自动拥有域名和 SSL 证书。
- **免维护**: 不需要服务器，不需要控制容器。
- **图床优化**: 已经内置了 Referrer 策略和跨域策略。

## 准备工作
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 在左侧菜单找到 **R2**，点击 **Create bucket**。
3. 创建一个名为 `webclipboard-storage` 的桶（如果你改了名字，请同步修改 `wrangler.toml`）。

## 部署步骤
1. 打开终端，进入 `cf_version` 目录。
2. 安装依赖：`npm install`
3. 登录 CF：`npx wrangler login`
4. 部署：`npx wrangler deploy`

## 你的专属网址
**部署成功后的访问地址：**
[https://webclipboard-cf.kasusaland.workers.dev](https://webclipboard-cf.kasusaland.workers.dev)

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

## 注意事项
- 你在 R2 创建的桶名字必须叫 `webclipboard-storage`。
- 只有上传了 `public/index.html` 之后，访问上面的网址才能看到界面。

---

## 🤓 技术原理 (为什么这个方案更牛？)

### 1. 强制 HTTPS 同化 (解决 Mixed Content)
- **以前**：你的服务器是 HTTP (88端口)，目标展示页是 HTTPS。浏览器为了安全，禁止在 HTTPS 页面加载内容。
- **现在**：Cloudflare 为 Worker 提供了 SSL 证书。图片链接变成了 `https://...`，浏览器不再拦截，顺滑显示。

### 2. Serverless + R2 (无硬盘架构)
- **以前**：你是在服务器的小硬盘上存东西。服务器一停，数据就断了。
- **现在**：后端逻辑写进了 **Worker (大脑)**，数据存进了 **R2 (超大云硬盘)**。即使没有实体服务器，你的应用也是永久在线的。

### 3. 边缘头信息重写 (解决图床 Referrer 问题)
你在代码 `src/index.js` 中可以看到我们显式设置了：
`Access-Control-Allow-Origin: *` 和 `Referrer-Policy: no-referrer`。这些是在 Cloudflare 的全球边缘节点上直接注入的，确保了无论在哪种网页环境下，图片都能成功跨域加载。
