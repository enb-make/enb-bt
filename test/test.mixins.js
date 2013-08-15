var BT = require('../lib/bt');
require('chai').should();

describe('ctx.getMixins()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should return mix', function() {
        var mix = [{ block: 'mix' }];
        bt.match('button', function(ctx) {
            ctx.getMixins().should.equal(mix);
        });
        bt.apply({ block: 'button', mixins: mix });
    });
});

describe('ctx.addMixin()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should set mix', function() {
        bt.match('button', function(ctx) {
            ctx.addMixin({block: 'mix', param: 1});
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button _init" data-block="button" ' +
            'ondblclick="return {&quot;mixins&quot;:[{&quot;block&quot;:&quot;mix&quot;,&quot;param&quot;:1}]};"' +
            '></div>'
        );
    });
    it('should extend user mix', function() {
        bt.match('button', function(ctx) {
            ctx.addMixin({block: 'mix'});
        });
        bt.apply({ block: 'button', mixins: [{block: 'user-mix'}] }).should.equal(
            '<div class="button _init" data-block="button" ondblclick="' +
                'return {&quot;mixins&quot;:[' +
                    '{&quot;block&quot;:&quot;user-mix&quot;},' +
                    '{&quot;block&quot;:&quot;mix&quot;}' +
                ']};' +
            '"></div>'
        );
    });
});
