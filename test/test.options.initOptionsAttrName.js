var BT = require('../lib/bt');
require('chai').should();

describe('options', function() {
    describe('jsAttr', function() {
        var bt;
        beforeEach(function() {
            bt = new BT();
        });
        it('should use onclick and js format as default', function() {
            bt.match('button', function (ctx) {
                ctx.setInitOption('x', 1);
            });
            bt.apply({ block: 'button' }).should.equal(
                '<div class="button" data-block="button" ondblclick="return {&quot;options&quot;:{&quot;x&quot;:1}};">' +
                '</div>'
            );
        });
        it('should use js format as default and use initOptionsAttrName option', function() {
            bt.setOptions({
                initOptionsAttrName: 'onclick'
            });
            bt.match('button', function (ctx) {
                ctx.setInitOption('x', 1);
            });
            bt.apply({ block: 'button' }).should.equal(
                '<div class="button" data-block="button" onclick="return {&quot;options&quot;:{&quot;x&quot;:1}};">' +
                '</div>'
            );
        });
        it('should use onclick as default and use jsAttrScheme option', function() {
            bt.setOptions({
                initOptionsAttrScheme: 'json'
            });
            bt.match('button', function (ctx) {
                ctx.setInitOption('x', 1);
            });
            bt.apply({ block: 'button' }).should.equal(
                '<div class="button" data-block="button" ondblclick="{&quot;options&quot;:{&quot;x&quot;:1}}"></div>'
            );
        });
        it('should use jsAttrName and jsAttrScheme options', function() {
            bt.setOptions({
                initOptionsAttrName: 'data-bem',
                initOptionsAttrScheme: 'json'
            });
            bt.match('button', function (ctx) {
                ctx.setInitOption('x', 1);
            });
            bt.apply({ block: 'button' }).should.equal(
                '<div class="button" data-block="button" data-bem="{&quot;options&quot;:{&quot;x&quot;:1}}"></div>'
            );
        });
    });
});
