var BT = require('../lib/bt');
require('chai').should();

describe('ctx.setContent()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should set bemjson content', function() {
        bt.match('button', function(ctx) {
            ctx.setContent({ elem: 'text' });
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button"><div class="button__text"></div></div>'
        );
    });
    it('should set bemjson array content', function() {
        bt.match('button', function(ctx) {
            ctx.setContent([{ elem: 'text1' }, { elem: 'text2' }]);
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button">' +
                '<div class="button__text1"></div>' +
                '<div class="button__text2"></div>' +
            '</div>'
        );
    });
    it('should set bemjson string content', function() {
        bt.match('button', function(ctx) {
            ctx.setContent('Hello World');
        });
        bt.apply({ block: 'button' }).should.equal('<div class="button" data-block="button">Hello World</div>');
    });
    it('should set bemjson numeric content', function() {
        bt.match('button', function(ctx) {
            ctx.setContent(123);
        });
        bt.apply({ block: 'button' }).should.equal('<div class="button" data-block="button">123</div>');
    });
    it('should set bemjson zero-numeric content', function() {
        bt.match('button', function(ctx) {
            ctx.setContent(0);
        });
        bt.apply({ block: 'button' }).should.equal('<div class="button" data-block="button">0</div>');
    });
});
