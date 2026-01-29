// ==UserScript==
// @name         Note Image Viewer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在该页面右上角添加图片按钮，获取并显示当前 xxx.txt 对应的图片
// @author       Antigravity
// @match        http://xxx
// @match        http://xxx/index.html
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    const targetOrigin = window.location.origin;

    GM_addStyle(`
        #note-image-wrapper {
            position: fixed;
            top: 20px;
            right: 74px; /* 避开日记助手按钮 */
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }

        #image-toggle-btn {
            width: 44px;
            height: 44px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 22px;
            user-select: none;
        }

        #image-toggle-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            background: #fff;
        }

        #image-toggle-btn.active {
            background: #ff9800;
            color: white;
            border-color: #ff9800;
        }

        #image-container {
            margin-top: 12px;
            width: 320px;
            max-height: 500px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
            padding: 15px;
            display: none;
            flex-direction: column;
            overflow-y: auto;
            transform-origin: top right;
            animation: imgScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes imgScaleIn {
            from { opacity: 0; transform: scale(0.8) translateY(-10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }

        #image-container.show {
            display: flex;
        }

        .image-box-title {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #333;
            display: flex;
            justify-content: space-between;
        }

        .note-image-item {
            width: 100%;
            border-radius: 10px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .note-image-item:hover {
            transform: scale(1.03);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .no-image-hint {
            text-align: center;
            color: #999;
            padding: 20px;
            font-size: 13px;
        }

        /* 深色模式适配 */
        #note-image-wrapper.dark-mode #image-toggle-btn {
            background: rgba(40, 40, 40, 0.8);
            color: #eee;
            border-color: rgba(255, 255, 255, 0.1);
        }

        #note-image-wrapper.dark-mode #image-container {
            background: rgba(30, 30, 30, 0.85);
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        #note-image-wrapper.dark-mode .image-box-title {
            color: #eee;
        }
    `);

    // 获取当前选中的标识符（从输入框中获取，去除 .txt 后缀）
    function getCurrentIdentifier() {
        const input = document.getElementById('fileName');
        if (input && input.value) {
            return input.value.replace(/\.txt$/i, '');
        }
        return null;
    }

    // 获取并显示图片
    async function fetchAndShowImages(idStr) {
        const container = document.getElementById('image-container');
        if (!idStr) {
            container.innerHTML = `<div class="no-image-hint">请先在文件名框输入内容</div>`;
            return;
        }

        container.innerHTML = `<div class="image-box-title"><span>${idStr}</span></div><div class="no-image-hint">加载中...</div>`;

        try {
            const response = await fetch(`${targetOrigin}/api/getImageList/${idStr}`);
            if (!response.ok) throw new Error('Network response was not ok');

            const list = await response.json();
            container.innerHTML = `<div class="image-box-title"><span>${idStr}</span><span>(${list.length})</span></div>`;

            if (list.length === 0) {
                container.innerHTML += `<div class="no-image-hint">该分类无图片记录</div>`;
                return;
            }

            list.forEach(fileName => {
                const img = document.createElement('img');
                img.className = 'note-image-item';
                img.src = `${targetOrigin}/images/${idStr}/${fileName}`;
                img.loading = 'lazy';
                img.onclick = () => window.open(img.src, '_blank');
                container.appendChild(img);
            });
        } catch (err) {
            container.innerHTML = `<div class="image-box-title"><span>${idStr}</span></div><div class="no-image-hint">获取图片列表失败</div>`;
            console.error(err);
        }
    }

    function updateDarkMode() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        const wrapper = document.getElementById('note-image-wrapper');
        if (wrapper) {
            wrapper.classList.toggle('dark-mode', isDark);
        }
    }

    // 初始化界面
    const wrapper = document.createElement('div');
    wrapper.id = 'note-image-wrapper';

    const imageBtn = document.createElement('div');
    imageBtn.id = 'image-toggle-btn';
    imageBtn.innerText = '🖼️';
    imageBtn.title = '载入当前文件对应图片';

    const imgContainer = document.createElement('div');
    imgContainer.id = 'image-container';

    imageBtn.addEventListener('click', () => {
        const isShow = imgContainer.classList.toggle('show');
        imageBtn.classList.toggle('active', isShow);
        if (isShow) {
            fetchAndShowImages(getCurrentIdentifier());
        }
    });

    wrapper.appendChild(imageBtn);
    wrapper.appendChild(imgContainer);
    document.body.appendChild(wrapper);

    // 点击外部关闭
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            imgContainer.classList.remove('show');
            imageBtn.classList.remove('active');
        }
    });

    // 监听输入框变化，如果图片列表开着，自动刷新
    const fileNameInput = document.getElementById('fileName');
    if (fileNameInput) {
        fileNameInput.addEventListener('change', () => {
            if (imgContainer.classList.contains('show')) {
                fetchAndShowImages(getCurrentIdentifier());
            }
        });
        // 也可以监听键盘 Enter
        fileNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && imgContainer.classList.contains('show')) {
                setTimeout(() => fetchAndShowImages(getCurrentIdentifier()), 100);
            }
        });
    }

    updateDarkMode();
    setInterval(updateDarkMode, 1000);

})();
