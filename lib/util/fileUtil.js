var fs = require('fs'),
    path = require('path');

// ��������Ŀ¼
module.exports = {
    mkdirs:function (dirpath, mode, callback) {
        if (typeof mode === 'function') {
            callback = mode;
        }

        path.exists(dirpath, function (exists) {
            if (exists) {
                callback(dirpath);
            } else {
                //���Դ�����Ŀ¼��Ȼ���ٴ�����ǰĿ¼
                module.exports.mkdirs(path.dirname(dirpath), mode, function () {
                    fs.mkdir(dirpath, mode, callback);
                });
            }
        });
    },
    mkdirsSync:function (dirpath, mode) {
        if(!path.existsSync(dirpath)) {
            //���Դ�����Ŀ¼��Ȼ���ٴ�����ǰĿ¼
            module.exports.mkdirsSync(path.dirname(dirpath), mode);
            fs.mkdirSync(dirpath, mode);
        }
    }
};