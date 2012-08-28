var ModuleComplier = require('../lib/base').ModuleComplier,
    path = require('path');

// test charset setting. from utf-8 sources to gbk distribution.
var sourcePath = path.resolve(__dirname, './complier-test/src'),
    distPath = path.resolve(__dirname, './complier-test/dist');
ModuleComplier.config({
    packages: [
        {
            name: 'test-charset',
            path: sourcePath,
            // this charset specifies source file charset.
            charset: 'utf-8'
        }
    ],
    suffix: '',
    // output to gbk distribution
    charset: 'gbk'
});

ModuleComplier.build(path.resolve(sourcePath, './test-charset/init.js'), path.resolve(distPath, './test-charset/init.js'));

var app2 = 'test-charset-gbk2gbk';
ModuleComplier.config({
    packages: [
        {
            name: app2,
            path: sourcePath,
            // this charset specifies source file charset.
            charset: 'gbk'
        }
    ],
    suffix: '',
    // output to gbk distribution
    charset: 'gbk'
});

ModuleComplier.build(path.resolve(sourcePath, app2 + '/init.js'), path.resolve(distPath, app2 + '/init.js'));