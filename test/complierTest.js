var ModuleComplier = require('../lib/base').ModuleComplier;

ModuleComplier.build({
    target:'F:/testbuild/assets/v2/sh/combo/detail.js',
    base: [
        'F:\\testbuild\\assets\\v2',
        'F:\\SVN\\fed\\kissy-team\\kissy\\src'
    ],
    debug: true,
    inputEncoding:'gbk',
    outputEncoding:'gbk',
    output:'f:\\testbuild'
});
