# tbuild

包括了一些常用的打包工具，java to nodejs

## 安装
    npm install tbuild

or

    git clone git://github.com/czy88840616/tbuild.git

## 包含的工具有
* ModuleComplier：KISSY(>=1.2) ModuleComplier的nodejs版本
* EasyCombo：一个简单的合并文件工具

### ModuleComplier

*Example:*

    var ModuleComplier = require('tbuild').ModuleComplier;

    // 这里和KISSY.config一样，先配置包
    ModuleComplier.config({
        packages: [{
            'name': 'sh',
            'path': '这里建议写绝对路径',
            'charset': 'gbk'
        }]
    });

    ModuleComplier.build('xxx.js', 'xxx.combine.js');

*API:*

    ModuleComplier.config(cfg);
    ModuleComplier.build(inputPath, outputPath);

* cfg:{Object} 参数

    * packages：{Array} KISSY的包。参见：http://docs.kissyui.com/1.2/docs/html/api/seed/loader/add.html#packages
    * suffix：{String} 输出的文件名后缀，不带.js，比如打包后你想输出为xxx.combine.js，那么这里就配置为：.combine,
    * map: {Array} 类似于KISSY的map方法，可以自己定义把模块名中的路径进行替换，比如把header/abc这个模块名替换为header/cdef，就应该这么配置：map: [['header/abc', 'header/cdef']]；map可以叠加
    * charset: {String} 配置输出的编码

* inputPath: {String} 需要打包的文件路径或者目录
* outputPath: {String} 需要输出的文件路径

*Advanced Example:*

    var ModuleComplier = require('tbuild').ModuleComplier;

    // 这里和KISSY.config一样，先配置包
    ModuleComplier.config({
        packages: [{
            'name': 'app1',
            'path': '这里写绝对路径',
            // 这里是指app1这个包源码的编码
            'charset': 'gbk'
        }, {
            'name': 'app2',
            'path': 'app2的绝对路径',
            // 这里是指app2这个包源码的编码
            'charset': 'utf-8'
        }],
        map: [
            // 这样配置的话，那么，如果原先输出的app1的模块名中含有app1/2.0/字样的话，就会被替换成app1/19891014/
            ['app1/2.0/', 'app1/19891014/']
        ],
        // 这里设置的是最后打包出来的文件的编码
        charset: 'gbk'
    });

    ModuleComplier.build('xxx.js', 'xxx.combine.js');

### EasyCombo

*Example:*

    var EasyCombo = require('tbuild').EasyCombo;

    EasyCombo.build({
        base:'D:\\project\\tradeface\\assets\\4.0',
        outputBase:'D:\\project\\tradeface\\assets\\testbuild',
        output:'tc/cart/cart.combine.css',
        includes:[
            'tc/cart/cart.css',
            'tc/cart/order.css',
            'tc/cart/item.css'
        ]
    });

*API:*

    EasyComplier.build(cfg);

* cfg:{Object} 参数

    * base：{String} 需要打包的根目录，可以使用相对路径
    * outputBase：{String} 输出目录，可选，如果不填，那么output将以base作为根目录
    * output：{String} 输出文件，相对路径
    * includes: {Array} 基于base的等待打包文件列表
    * inputEncoding：{String} 输入文件编码，可选，默认GBK
    * outputEncoding：{String} 输出文件编码，可选，默认GBK

### CssCombo

*API:*

    参见https://github.com/daxingplay/css-combo

## License
tbulid 遵守 "MIT"：https://github.com/czy88840616/tbuild/blob/master/LICENSE.md 协议