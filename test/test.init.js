var BT = require('../lib/bt');
require('chai').should();

describe('ctx.js()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should return autoInit', function() {
        bt.match('button', function(ctx) {
            ctx.isAutoInitEnabled().should.equal(true);
        });
        bt.apply({ block: 'button', autoInit: true });
    });
    it('should set autoInit', function() {
        bt.match('button', function(ctx) {
            ctx.enableAutoInit();
        });
        bt.apply({ block: 'button', autoInit: true }).should.equal(
            '<div class="button _init" data-block="button"></div>'
        );
    });
    it('should set init options', function() {
        bt.match('button', function(ctx) {
            ctx.setInitOption('x', 1);
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button" ondblclick="return {&quot;options&quot;:{&quot;x&quot;:1}};">' +
            '</div>'
        );
    });
    it('should set elem init options', function() {
        bt.match('button', function(ctx) {
            ctx.setContent({elem: 'text'});
        });
        bt.match('button__text', function(ctx) {
            ctx.setInitOption('x', 1);
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button">' +
                '<div class="button__text" ondblclick="return {&quot;options&quot;:{&quot;x&quot;:1}};"></div>' +
            '</div>'
        );
    });
});


