function check(fileName){
    // 检查文件扩展名是否为.txt
    if (!fileName.endsWith('.txt')) {
        return 'Invalid file format. Only .txt files are allowed.';
    }
    // 删除.txt后是否存在点号
    if (fileName.replace('.txt','').includes('.')) {
        return 'too much "."';
    }
    // 是否包含斜杠
    if (fileName.includes('\\')) {
        return 'Invalid file name. File name cannot contain "/"';
    }
    // 无问题返回
    return 'ok';
}

function checkimageboxname(boxname){
    // 检查是否为空
    if (!boxname || boxname.trim() === '') {
        return '图片盒名称不能为空';
    }
    
    // 直接检测URL编码的目录穿越攻击
    if (boxname.includes('%2e%2e') || boxname.includes('..') ) {
        return '检测到URL编码的目录穿越攻击';
    }
    
    // 检查解码后的路径分隔符（防止目录穿越）
    let decodedBoxname = boxname;
    let prevDecoded = '';
    
    // 处理多重URL编码
    while (decodedBoxname !== prevDecoded) {
        prevDecoded = decodedBoxname;
        try {
            decodedBoxname = decodeURIComponent(decodedBoxname);
        } catch (e) {
            return '图片盒名称包含无效的URL编码';
        }
    }
    
    if (decodedBoxname.includes('/') || decodedBoxname.includes('\\') || decodedBoxname.includes('..')) {
        return '检测到目录穿越攻击，图片盒名称不能包含路径分隔符或".."';
    }
    
    // 检查解码后的名称是否只包含合法字符（字母、数字、下划线、连字符）
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(decodedBoxname)) {
        return '图片盒名称只能包含字母、数字、下划线和连字符';
    }
    
    // 检查长度限制
    if (decodedBoxname.length > 50) {
        return '图片盒名称过长，最多50个字符';
    }
    
    // 无问题返回
    return 'ok';
}

function checkImageFilename(filename){
    // 检查是否为空
    if (!filename || filename.trim() === '') {
        return '图片文件名不能为空';
    }
    
    // 检查模板注入攻击
    if (filename.includes('{{') || filename.includes('}}') || 
        filename.includes('${') || filename.includes('}') ||
        filename.includes('url(') || filename.includes('}}')) {
        return '检测到模板注入攻击，图片文件名不能包含模板语法';
    }

    // 检查解码后的路径分隔符（防止目录穿越）
    let decodedFilename = filename;
    let prevDecoded = '';
    
    // 处理多重URL编码
    while (decodedFilename !== prevDecoded) {
        prevDecoded = decodedFilename;
        try {
            decodedFilename = decodeURIComponent(decodedFilename);
        } catch (e) {
            return '图片文件名包含无效的URL编码';
        }
    }
    
    if (decodedFilename.includes('/') || decodedFilename.includes('\\') || decodedFilename.includes('..')) {
        return '检测到目录穿越攻击，图片文件名不能包含路径分隔符或".."';
    }
    
    // 检查文件扩展名是否为图片格式
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
        return '不支持的图片格式，只允许 jpg, jpeg, png, gif, bmp, webp';
    }
    
    // 检查文件名长度
    if (filename.length > 100) {
        return '图片文件名过长，最多100个字符';
    }
    
    // 检查是否包含危险字符（防止命令注入等攻击）
    const dangerousChars = ['<', '>', '"', "'", '&', '|', ';', '`', '$', '(', ')', '{', '}', '[', ']'];
    for (let char of dangerousChars) {
        if (filename.includes(char)) {
            return `图片文件名不能包含危险字符: ${char}`;
        }
    }
    
    // 检查是否包含控制字符（只检查真正的控制字符，不包括空格和可打印字符）
    for (let i = 0; i < filename.length; i++) {
        const charCode = filename.charCodeAt(i);
        // 只检查真正的控制字符：0-31（除了空格32）和127（DEL）
        if ((charCode >= 0 && charCode < 32 && charCode !== 32) || charCode === 127) {
            return '图片文件名不能包含控制字符';
        }
    }
    
    // 无问题返回
    return 'ok';
}

exports.check = check;
exports.checkimageboxname = checkimageboxname;
exports.checkImageFilename = checkImageFilename;