var BT = require('../lib/bt');
require('chai').should();

describe('matching', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should accept array replacement', function () {
        bt.match('page', function(ctx) {
            ctx.setTag('html');
            ctx.disableCssClassGeneration();
            ctx.disableDataAttrGeneration();
            return [
                '<!DOCTYPE>',
                ctx.getJson()
            ];
        });
        bt.apply({ block: 'page' }).should.equal(
            '<!DOCTYPE><html></html>'
        );
    });
    it('should accept string replacement', function () {
        bt.match('page', function() {
            return 'Hello';
        });
        bt.apply({ block: 'page' }).should.equal('Hello');
    });
    it('should accept numeric replacement', function () {
        bt.match('page', function() {
            return 0;
        });
        bt.apply({ block: 'page' }).should.equal(0);
    });
    it('should match block and child', function () {
        bt.match('button', function(ctx) {
            ctx.setTag('span');
            ctx.disableDataAttrGeneration();
            ctx.setContent({ elem: 'text' });
        });
        bt.match('button__text', function(ctx) {
            ctx.setTag('i');
        });
        bt.apply({ block: 'button' }).should.equal('<span class="button"><i class="button__text"></i></span>');
    });
    it('should multiple match block and child', function () {
        bt.match('button', function(ctx) {
            ctx.setTag('span');
            ctx.disableDataAttrGeneration();
            ctx.setContent([{ elem: 'icon' }, { elem: 'text' }]);
        });
        bt.match(['button__text', 'button__icon'], function(ctx) {
            ctx.setTag('i');
        });
        bt.apply({ block: 'button' }).should.equal(
            '<span class="button"><i class="button__icon"></i><i class="button__text"></i></span>'
        );
    });
    it('should match block and child using view', function () {
        bt.match('button_def', function(ctx) {
            ctx.setTag('span');
            ctx.disableDataAttrGeneration();
            ctx.setContent({ elem: 'text' });
        });
        bt.match('button_def__text', function(ctx) {
            ctx.setTag('i');
        });
        bt.apply({ block: 'button', view: 'def' }).should.equal(
            '<span class="button_def"><i class="button_def__text"></i></span>'
        );
    });
    it('should match block and child using view ns', function () {
        bt.match('button_def*', function(ctx) {
            ctx.setTag('span');
            ctx.disableDataAttrGeneration();
            ctx.setContent({ elem: 'text' });
        });
        bt.match('button_def*__text', function(ctx) {
            ctx.setTag('i');
        });
        bt.apply({ block: 'button', view: 'def' }).should.equal(
            '<span class="button_def"><i class="button_def__text"></i></span>'
        );
    });
    it('should match block and child using view ns', function () {
        bt.match('button_def*', function(ctx) {
            ctx.setTag('span');
            ctx.disableDataAttrGeneration();
            ctx.setContent({ elem: 'text' });
        });
        bt.match('button_def*__text', function(ctx) {
            ctx.setTag('i');
        });
        bt.apply({ block: 'button', view: 'def-xxx' }).should.equal(
            '<span class="button_def-xxx"><i class="button_def-xxx__text"></i></span>'
        );
    });

    describe('block*', function () {
        beforeEach(function () {
            bt.match('button*', function (ctx) {
                ctx.setTag('span');
                ctx.disableDataAttrGeneration();
                ctx.setContent({elem: 'text'});
            });

            bt.match('button*__text', function (ctx) {
                ctx.setTag('i');
            });
        });

        it('should match block and element without view', function () {
            bt.apply({block: 'button'}).should.eq(
                '<span class="button"><i class="button__text"></i></span>'
            );
        });

        it('should match block and element with view', function () {
            bt.apply({block: 'button', view: 'foo'}).should.eq(
                '<span class="button_foo"><i class="button_foo__text"></i></span>'
            );

            bt.apply({block: 'button', view: 'foo-bar'}).should.eq(
                '<span class="button_foo-bar"><i class="button_foo-bar__text"></i></span>'
            );
        });
    });
});
