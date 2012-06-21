var ModuleComplier = require('../lib/base').ModuleComplier;

ModuleComplier.config({
    packages: [
        {
            name: 'sh',
            path: 'F:\\testbuild\\assets\\v2\\',
            charset: 'gbk'
        }
    ],
    suffix: '',
    charset: ''
});

ModuleComplier.build('F:/testbuild/assets/v2/sh/combo/detail.js', 'F:/testbuild/v2/sh/combo/detail.js');

ModuleComplier.config({
    packages: [{
        name: 'user-credits',
        path: 'F:/Website/htdocs/secondhand/assets/',
        charset: 'gbk'
    },{
        name: 'utils',
        path: 'F:/Website/htdocs/secondhand/assets/',
        charset: 'gbk'
    }],
    map: [
        ['user-credits/1.0/', 'user-credits/20120601/']
    ]
});

ModuleComplier.build('F:/Website/htdocs/secondhand/assets/user-credits/1.0/core/user-credits.js', 'F:/testbuild/v2/sh/combo/user-credit.js');

//ModuleComplier.build({
//    target:'F:/testbuild/assets/v2/sh/combo/detail.js',
//    base: [
//        'F:\\testbuild\\assets\\v2',
//        'F:\\SVN\\fed\\kissy-team\\kissy\\src'
//    ],
//    debug: true,
//    inputEncoding: 'gbk',
//    outputEncoding:'gbk',
//    output:'f:\\testbuild'
//});
