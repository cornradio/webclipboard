import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// 允许跨域
app.use('*', cors());

// --- 辅助函数：密码验证 ---
async function verifyPassword(c, boxname) {
    const password = c.req.header('x-box-password');
    const storedPwdObj = await c.env.BUCKET.get(`passwords/${boxname}`);
    if (!storedPwdObj) return true; // 无密码，直接过
    const storedPwd = await storedPwdObj.text();
    return storedPwd === password;
}

// --- 1. 文本同步 API ---
app.get('/api/readfile/:fileName', async (c) => {
    const fileName = c.req.param('fileName');
    const file = await c.env.BUCKET.get(`txts/${fileName}`);
    if (!file) return c.text('file not found');
    return c.text(await file.text());
});

app.post('/api/writefile/:fileName', async (c) => {
    const fileName = c.req.param('fileName');
    const { content } = await c.req.json();
    await c.env.BUCKET.put(`txts/${fileName}`, content);
    return c.text('OK');
});

// --- 2. 密码管理 ---
app.get('/api/hasPassword/:boxname', async (c) => {
    const boxname = c.req.param('boxname');
    const file = await c.env.BUCKET.get(`passwords/${boxname}`);
    return c.json({ hasPassword: !!file });
});

// 获取全系统是否已经有加密的 Box
app.get('/api/systemStatus', async (c) => {
    const objects = await c.env.BUCKET.list({ prefix: 'passwords/', limit: 1 });
    const isSystemProtected = objects.objects.length > 0;
    return c.json({ isSystemProtected });
});

app.post('/api/setPassword/:boxname', async (c) => {
    const boxname = c.req.param('boxname');
    const { oldPassword, newPassword, authBoxName, authPassword } = await c.req.json();

    const storedPwdObj = await c.env.BUCKET.get(`passwords/${boxname}`);
    if (storedPwdObj) {
        // 情况 A：本 Box 已经有密码，走正常的修改逻辑
        const storedPwd = await storedPwdObj.text();
        if (storedPwd !== oldPassword) return c.text('原密码错误', 401);
    } else {
        // 情况 B：本 Box 目前没密码，尝试开启保护
        // 检查系统中是否已经存在其他加密的 Box
        const objects = await c.env.BUCKET.list({ prefix: 'passwords/', limit: 1 });
        if (objects.objects.length > 0) {
            // 系统处于锁定状态，必须提供另一个受保护 Box 的信息进行授权
            if (!authBoxName || !authPassword) {
                return c.text('系统已锁定，请提供其他已加密 Box 的名称和密码进行授权', 403);
            }
            const authPwdObj = await c.env.BUCKET.get(`passwords/${authBoxName}`);
            if (!authPwdObj || (await authPwdObj.text()) !== authPassword) {
                return c.text('授权 Box 名称或密码错误', 401);
            }
        }
    }

    if (!newPassword) {
        await c.env.BUCKET.delete(`passwords/${boxname}`);
        return c.text('Password removed');
    } else {
        await c.env.BUCKET.put(`passwords/${boxname}`, newPassword);
        return c.text('Password set');
    }
});

// --- 3. 图片管理 ---
// 获取图片列表
app.get('/api/getImageList/:boxname', async (c) => {
    const boxname = c.req.param('boxname');
    const prefix = `images/${boxname}/`;
    const objects = await c.env.BUCKET.list({ prefix });
    const files = objects.objects.map(obj => obj.key.replace(prefix, ''));
    return c.json(files);
});

// 上传图片
app.post('/api/uploadImage/:boxname', async (c) => {
    const boxname = c.req.param('boxname');
    if (!(await verifyPassword(c, boxname))) return c.text('密码错误或需要密码', 401);

    const formData = await c.req.parseBody();
    const files = Array.isArray(formData.image) ? formData.image : [formData.image];

    for (const file of files) {
        if (file instanceof File) {
            await c.env.BUCKET.put(`images/${boxname}/${file.name}`, await file.arrayBuffer(), {
                httpMetadata: { contentType: file.type }
            });
        }
    }
    return c.text('scs');
});

// 删除图片
app.post('/api/deleteImage/:boxname/:filename', async (c) => {
    const boxname = c.req.param('boxname');
    const filename = c.req.param('filename');
    if (!(await verifyPassword(c, boxname))) return c.text('密码错误', 401);

    await c.env.BUCKET.delete(`images/${boxname}/${filename}`);
    return c.text('Image deleted successfully');
});

// 清空 Box
app.post('/api/clearBox/:boxname', async (c) => {
    const boxname = c.req.param('boxname');
    if (!(await verifyPassword(c, boxname))) return c.text('密码错误', 401);

    const prefix = `images/${boxname}/`;
    const objects = await c.env.BUCKET.list({ prefix });
    for (const obj of objects.objects) {
        await c.env.BUCKET.delete(obj.key);
    }
    return c.text('Folder cleared successfully');
});

// --- 5. 白名单管理 (防盗链) ---
app.get('/api/getWhitelist/:boxname', async (c) => {
    const boxname = c.req.param('boxname');
    const hasPwd = await c.env.BUCKET.get(`passwords/${boxname}`);
    if (hasPwd && !(await verifyPassword(c, boxname))) return c.text('Unauthorized', 401);

    const obj = await c.env.BUCKET.get('config/whitelist.txt');
    const content = obj ? await obj.text() : '';
    const enabledObj = await c.env.BUCKET.get('config/whitelist_enabled.txt');
    const enabled = enabledObj ? (await enabledObj.text()) === 'true' : false;
    return c.json({ content, enabled });
});

app.post('/api/setWhitelist/:boxname', async (c) => {
    const boxname = c.req.param('boxname');
    const hasPwd = await c.env.BUCKET.get(`passwords/${boxname}`);
    if (!hasPwd) return c.text('为了安全，请在受密码保护的 Box 中修改全局设置', 403);
    if (!(await verifyPassword(c, boxname))) return c.text('密码错误', 401);

    const { content, enabled } = await c.req.json();
    await c.env.BUCKET.put('config/whitelist.txt', content);
    await c.env.BUCKET.put('config/whitelist_enabled.txt', enabled ? 'true' : 'false');
    return c.text('OK');
});

// --- 4. 静态资源转发 (图床核心) ---
// 访问图片: /images/:boxname/:filename
app.get('/images/:boxname/:filename', async (c) => {
    const { boxname, filename } = c.req.param();

    // --- 防盗链逻辑 ---
    const enabledObj = await c.env.BUCKET.get('config/whitelist_enabled.txt');
    const enabled = enabledObj ? (await enabledObj.text()) === 'true' : false;

    if (enabled) {
        const referer = c.req.header('Referer');
        const whitelistObj = await c.env.BUCKET.get('config/whitelist.txt');
        const whitelist = whitelistObj ? (await whitelistObj.text()).split('\n').map(s => s.trim()).filter(s => s) : [];

        if (referer) {
            try {
                const origin = new URL(referer).origin;
                // 严格匹配：不在白名单里就滚蛋
                if (!whitelist.includes(origin)) {
                    return new Response("Forbidden: This domain is not in the whitelist.", { status: 403 });
                }
            } catch (e) {
                return new Response("Forbidden: Invalid Referer.", { status: 403 });
            }
        } else {
            // 没有 Referer (直接访问) - 既然开启了白名单，为了安全直接访问也要拦截
            return new Response("Forbidden: Direct access is blocked when whitelist is enabled.", { status: 403 });
        }
    }

    const object = await c.env.BUCKET.get(`images/${boxname}/${filename}`);

    if (!object) return c.notFound();

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    headers.set('Cache-Control', 'public, max-age=31536000');
    // 重要：为了适配图床，设置 Referrer Policy
    headers.set('Referrer-Policy', 'no-referrer');

    return new Response(object.body, { headers });
});

// 访问 UI: 根目录或其他
app.get('*', async (c) => {
    const path = c.req.path === '/' ? 'index.html' : c.req.path.substring(1);
    const object = await c.env.BUCKET.get(`public/${path}`);

    if (!object) return c.text('Not Found', 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    return new Response(object.body, { headers });
});

export default app;
