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

exports.check = check;