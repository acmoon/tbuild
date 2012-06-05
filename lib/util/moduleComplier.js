var fs = require('fs'),
    path = require('path'),
    fileUtil = require('./fileUtil'),
    iconv = require('iconv-lite');

var ModuleComplier = function(){

    var config = {},
        modulesCache = [],
        commentTpl = [
            '/*\r\n',
            'combined files : \r\n',
            '\r\n'
        ];

    function parseConfig(cfg){
        cfg.target = path.resolve(cfg.target);
        if(!cfg.target && path.existsSync(cfg.target)) {
            console.log('please enter an complier path\r\n');
            return null;
        }

        if(!cfg.inputEncoding || cfg.inputEncoding == 'gbk' || cfg.inputEncoding == 'GBK' || cfg.inputEncoding == 'gb2312') {
            cfg.inputEncoding = '';
        }

        if(!cfg.outputEncoding || cfg.outputEncoding == 'gbk' || cfg.outputEncoding == 'GBK' || cfg.outputEncoding == 'gb2312') {
            cfg.outputEncoding = '';
        }

        cfg.base = cfg.base || __dirname;

        if(typeof cfg.base === 'string'){
            cfg.base = [cfg.base];
        }
        cfg.packagePath = '';
        cfg.curTargetName = '';
        for(var i = 0; i < cfg.base.length; i++){
            cfg.base[i] = path.resolve(cfg.base[i]);
            var targetRelativePath = path.relative(cfg.base[i], cfg.target);
            if(cfg.curTargetName == '' || (targetRelativePath && targetRelativePath.length < cfg.curTargetName.length)){
                cfg.curTargetName = targetRelativePath;
                cfg.packagePath = cfg.base[i];
            }
        }

        if(cfg.output) {
            cfg.output = path.resolve(cfg.output);
        }

        console.log(cfg);

        return cfg;
    }

    function isExcluded(filename){
        if(typeof config.exclude === 'object' && config.exclude.length > 0){
            for (var idx in config.exclude) {
                if(config.exclude[idx].test(filename)) {
                    return true;
                }
            }
        }
        return false;
    }

    function minify(str){
        var totallen = str.length,
            token;

        // remove single line comments
        var startIndex = 0;
        var endIndex = 0;
        var comments = [];
        while ((startIndex = str.indexOf("//", startIndex)) >= 0) {
            endIndex = str.indexOf("\n", startIndex + 2);
            if (endIndex < 0) {
                endIndex = totallen;
            }
            token = str.slice(startIndex + 2, endIndex);
            comments.push(token);
            startIndex += 2;
        }
        for (i=0,max=comments.length; i<max; i = i+1){
            str = str.replace("//" + comments[i] + "\n", "");
        }

        // remove multi line comments.
        startIndex = 0;
        endIndex = 0;
        comments = [];
        while ((startIndex = str.indexOf("/*", startIndex)) >= 0) {
            endIndex = str.indexOf("*/", startIndex + 2);
            if (endIndex < 0) {
                endIndex = totallen;
            }
            token = str.slice(startIndex + 2, endIndex);
            comments.push(token);
            startIndex += 2;
        }
        for (i=0,max=comments.length; i<max; i = i+1){
            str = str.replace("/*" + comments[i] + "*/", "");
        }

        // remove white spaces
        str = str.replace(/\s+/g, " ");

        return str;
    }

    function analyzeRequires(filePath){
        var fileContent = fs.readFileSync(filePath).toString();
        // remove comments
        fileContent = minify(fileContent);

        var requires = fileContent.match(/\{[\s\w:'",]*requires\s?:(\[?[^;\}]*\]?)\}\)/g);
        if(requires != null){
            for(var i = 0; i < requires.length; i++){
                var requiredModules = eval('(' + requires[i]);
                requiredModules = analyzePath(requiredModules.requires, path.dirname(filePath));
                for(var j = 0; j < requiredModules.length; j++){
                    var curModule = requiredModules[j];
                    if(modulesCache[curModule] != curModule){
                        modulesCache[curModule] = curModule;
                        commentTpl.push(curModule + '\r\n');
                        analyzeRequires(curModule);
                    }
                }
            }
        }else{
            config.debug && console.log('INFO: module ' + filePath + ' has no depends.');
        }
    }

    function analyzePath(requires, curDir){
        var checkedRequires = [];
        for(var i = 0; i < requires.length; i++){
            var require = requires[i];
            if(require){
                var current;
                if(require.match(/^\.{1,2}/)){
                    current = path.normalize(path.join(curDir, require));
                }else{
                    current = findModule(require);
                }
                if(current){
                    var ext = path.extname(current);
                    if(!ext){
                        current = current + '.js';
                        ext = '.js';
                    }
                    if(ext === '.js'){
                        if(path.existsSync(current)){
                            checkedRequires.push(current);
                        }else{
                            console.log('WARNING: ignore module: ' + require);
                        }
                    }
                }
            }
        }
        return checkedRequires;
    }

    function findModule(require){
        var modulePath = '',
            base = config.base;
        for(var i = 0; i < base.length; i++){
            var curPath = path.normalize(path.join(base[i], require)),
                ext = path.extname(curPath);
            if(!ext) {
                curPath = curPath + '.js';
            }
            if(!ext || ext == '.js'){
                if(path.existsSync(curPath)){
                    modulePath = curPath;
                    break;
                }
            }
        }
        return modulePath;
    }

    function comboFile(){
        commentTpl.push('*/\r\n');

        var combineFile = path.join(config.output, config.curTargetName).replace(/(\.source)?\.js/, '.combine.js');

        //prepare output dir
        fileUtil.mkdirsSync(path.dirname(combineFile));

        var fd = fs.openSync(combineFile, 'w');
        fs.writeSync(fd, commentTpl.join(''), 0, config.outputEncoding);
        fs.closeSync(fd);

        fd = fs.openSync(combineFile, 'a');

        for (var i in modulesCache) {
            var modulePath = modulesCache[i];
            var moduleContent = iconv.decode(fs.readFileSync(modulePath, config.inputEncoding), config.inputEncoding || 'gbk');

            //add module path
            var start = moduleContent.indexOf('KISSY.add(');
            if(start == -1) {
                start = moduleContent.indexOf('.add(');
                if(start != -1) {
                    start = start + 5;
                }
            } else {
                start = start + 10;
            }

            var end = moduleContent.indexOf('function', start);

            var relativefile = path.relative(config.packagePath, modulePath).replace(/\\/g, '\/'),
                basename = path.basename(relativefile, '.js'),
                dirname = path.dirname(relativefile);

            //find it
            if(start > -1 && end > start) {
                //KISSY.add(/*xxx*/function(xxx))
                var moduleName = moduleContent.substring(start, end),
                    moduleNameRegResult = moduleName.match(/^\/\*(.*)\*\/$/);
                if(moduleNameRegResult != null){
                    moduleContent = moduleContent.replace(moduleName, moduleNameRegResult[1]);
                }
            } else if(start > -1 && end == start) {
                //KISSY.add(function(xxx))
                moduleContent = [moduleContent.slice(0, start), '\'' + dirname + '/' +  basename + '\',', moduleContent.slice(end)].join('');
            }

            var buffer = iconv.encode(moduleContent, config.inputEncoding || 'gbk');
            fs.writeSync(fd, buffer, 0, buffer.length);
        }

        fs.closeSync(fd);

        console.info('%s ===> %s', config.curTargetName, combineFile);
    }

    function buildOnce(file){
        analyzeRequires(file);
        comboFile();
    }

    return {
        build: function(cfg){
            config = parseConfig(cfg);
            if(config !== null){
                var target = config.target;
                if(fs.statSync(target).isDirectory()) {
                    var targets = fs.readdirSync(target);
                    for (var i in targets) {
                        if(path.extname(targets[i])==='.js' && !isExcluded(targets[i])) {
                            buildOnce(targets[i]);
                        }
                    }
                } else {
                    buildOnce(target);
                }
            }
        }
    }

};

module.exports = ModuleComplier();