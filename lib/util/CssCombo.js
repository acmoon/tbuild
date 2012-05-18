var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    url = require('url'),
    fileUtil = require('./fileUtil');

var CssCombo = function(){

    var debug = false,
        exclude = [/.combo.css/, /-min.css/, /.combine.css/],
        config = {},
        imports = [];

    function isExcluded(filename){
        for(var i in exclude){
            if(exclude[i].test(filename)){
                return true;
            }
        }
        return false;
    }

    function isRemoteFile(filepath){
        return /http(s?):\/\//.test(filepath);
    }

    function getRemoteFile(filePath, callback){
        var content = '',
            options = url.parse(filePath);
        if(typeof options != 'undefined'){
            console.log('start request');
            var req = http.request(options, function(res){
                console.log('status: ' + res.statusCode);
                res.on('data', function(chunk){
                    console.log('data got');
                    content += chunk;
                });
                res.on('end', function(){
                    callback && callback(content);
                });
            });
            req.on('error', function(e){
                console.log('request error: ' + e);
            });
            req.end();
        }else{
            console.log('parse error: ' + filePath);
            callback && callback(content);
        }
    }

    function getFileContent(file, callback){
        // TODO https ?
        var content = '';
        if(!isRemoteFile(file)){
            if(!isExcluded(file)){
                var filePath = path.resolve(config.base, file);
                content = fs.readFileSync(filePath, config.inputEncoding).toString();
            }else{
                console.log('file excluded: ' + file);
            }
            callback && callback(content);
        }else{
            // TODO get remote file content.
            console.log('This is a remote file: ' + file);
            getRemoteFile(file, function(data){
                content = data;
                callback && callback(data);
            });
        }
    }

    // TODO deal with charset
    function generateOutput(fileContent){
        var commentTpl = [
                '/*\r\n',
                'combined files : \r\n',
                '\r\n'
            ];

        for (var i in imports) {
            commentTpl.push(imports[i] + '\r\n');
        }

        commentTpl.push('*/\r\n');

        var comboFile = path.join(config.output, path.basename(config.target).replace(/(.source)?.css/, '.combo.css'));

//        fs.mkdirSync(path.dirname(comboFile));
        fileUtil.mkdirsSync(path.dirname(comboFile));

        var fd = fs.openSync(comboFile, 'w');
        //write comment
        fs.writeSync(fd, commentTpl.join('') + '\r\n' + fileContent, 0, config.outputEncoding);
        fs.closeSync(fd);
    }

    function analyzeImports(content, callback){
        if(content){
            var reg = /@import\s*(url)?\(?['|"]([^'"]+)\.css['|"]\)?[^;]*;/ig,
//            allReg = /@import\s*(url)?\(?['|"]([^'"]+)\.(c|le)ss['|"]\)?[^;]*;/ig,
                result;
            result = reg.exec(content);
            if(typeof result != 'undefined' && result && result[2]){
                var filePath = result[2] + '.css';
                imports.push(filePath);
                getFileContent(filePath, function(data){
                    if(content){
                        content = content.replace(result[0], '\n' + data + '\n');
                        content = analyzeImports(content, callback);
                    }else{
                        console.log('no content');
                    }
                });
            }else{
                callback && callback(content);
            }
        }else{
            console.log('content empty.');
        }
    }

    function buildFile(){
        var file = config.target;
        debug && console.log('start analyze file : ' + file);

        config.base = path.dirname(file);
        fs.readFile(file, config.inputEncoding, function(err, data){
            if(err){
                console.log(err);
            }

            var fileContent = data.toString();
            analyzeImports(fileContent, function(data){
                console.log('analyze done.');
                generateOutput(data);
            });

//            var fileContent = data.toString(),
//                imports = [],
////                lessImports = [],
//                result;
//            while((result = /@import\s*(url)?\(?['|"]([^'"]+)\.(c|le)ss['|"]\)?[^;]*;/ig.exec(fileContent)) != null){
//                console.log(result);
//                if(result[3] == 'c'){
//                    // TODO resolve path.
//                    var filePath = result[2] + '.css',
//                        importContent = getFileContent(filePath, cfg);
//                    imports.push(filePath);
//                    fileContent = fileContent.replace(result[0], '\n' + importContent + '\n');
//                }else if(result[3] == 'le'){
////                    lessImports.push(result[2] + '.less');
//                    // leave less files behind. I will deal with it later.
//                }else{
//                    debug && console.log('import file syntax error.');
//                }
//            }
////            console.log(fileContent);
//            generateFile(fileContent, cfg);
        });

    }

    return {
        build: function(cfg){
            if(!cfg.target) {
                console.log('please enter an complier path\r\n');
                return;
            }

            if(!cfg.inputEncoding || cfg.inputEncoding == 'gbk' || cfg.inputEncoding == 'GBK' || cfg.inputEncoding == 'gb2312') {
                cfg.inputEncoding = '';
            }

            if(!cfg.outputEncoding || cfg.outputEncoding == 'gbk' || cfg.outputEncoding == 'GBK' || cfg.outputEncoding == 'gb2312') {
                cfg.outputEncoding = '';
            }

            cfg.output = path.resolve(path.normalize(cfg.output));

            config = cfg;
            buildFile();
        }
    }
}();

module.exports = CssCombo;