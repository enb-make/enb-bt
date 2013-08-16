var BT = require('../lib/bt');
require('chai').should();

describe('bt.toHtml()', function() {
    describe('attrs', function() {
        var bt;
        beforeEach(function() {
            bt = new BT();
        });
        it('should ignore null attrs', function() {
            bt.match('button', function(ctx) {
                ctx.setTag('a');
            });
            bt.match('button', function(ctx) {
                ctx.setAttr('href', null);
            });
            bt.apply({ block: 'button' }).should.equal(
                '<a class="button" data-block="button"></a>'
            );
        });
        it('should not ignore empty attrs', function() {
            bt.match('button', function(ctx) {
                ctx.setTag('a');
            });
            bt.match('button', function(ctx) {
                ctx.setAttr('href', '');
            });
            bt.apply({ block: 'button' }).should.equal(
                '<a class="button" data-block="button" href=""></a>'
            );
        });
    });
    describe('states', function() {
        var bt;
        beforeEach(function() {
            bt = new BT();
        });
        it('should render states', function() {
            bt.match('button', function(ctx) {
                ctx.setTag('a');
                ctx.setContent({elem: 'text'});
            });
            bt.match('button', function(ctx) {
                ctx.setState('is-pressed');
            });
            bt.match('button__text', function(ctx) {
                ctx.setState('is-hovered');
            });
            bt.apply({ block: 'button' }).should.equal(
                '<a class="button _is-pressed" data-block="button"><div class="button__text _is-hovered"></div></a>'
            );
        });
        it('should ignore null states', function() {
            bt.match('button', function(ctx) {
                ctx.setTag('a');
                ctx.setContent({elem: 'text'});
            });
            bt.match('button', function(ctx) {
                ctx.setState('type', null);
            });
            bt.match('button__text', function(ctx) {
                ctx.setState('is-focused', null);
            });
            bt.apply({ block: 'button' }).should.equal(
                '<a class="button" data-block="button"><div class="button__text"></div></a>'
            );
        });
        it('should ignore empty states', function() {
            bt.match('button', function(ctx) {
                ctx.setTag('a');
            });
            bt.match('button', function(ctx) {
                ctx.setState('type', '');
            });
            bt.apply({ block: 'button' }).should.equal(
                '<a class="button" data-block="button"></a>'
            );
        });
    });
    describe('views', function() {
        var bt;
        beforeEach(function() {
            bt = new BT();
        });
        it('should render views', function() {
            bt.match('button_def', function(ctx) {
                ctx.setTag('a');
                ctx.setContent({elem: 'text'});
            });
            bt.match('button_def__text', function(ctx) {
                ctx.setTag('span');
            });
            bt.apply({ block: 'button', view: 'def' }).should.equal(
                '<a class="button_def" data-block="button"><span class="button_def__text"></span></a>'
            );
        });
    });
});
