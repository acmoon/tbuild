/**
 * @fileoverview ͨ��combo����ʽ���д��
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
var SmartCombo = function() {
    return {
        build:function(cfg){
            cfg.split = cfg.split || '??';
            cfg.suffix = cfg.suffix || '.combine.css'
        }
    }
}();

module.exports = SmartCombo;