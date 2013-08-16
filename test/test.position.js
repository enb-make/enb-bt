var BT = require('../lib/bt');
require('chai').should();

describe('ctx.isFirst() / ctx.isLast() / ctx.getPosition', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should calc isFirst/isLast', function() {
        bt.match('button', function (ctx) {
            ctx.setContent([
                { elem: 'inner' },
                { elem: 'inner' },
                { elem: 'inner' }
            ]);
        });
        bt.match('button__inner', function(ctx) {
            if (ctx.isFirst()) {
                ctx.setState('first', 'yes');
            }
            if (ctx.isLast()) {
                ctx.setState('last', 'yes');
            }
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button">' +
            '<div class="button__inner _first_yes"></div>' +
            '<div class="button__inner"></div>' +
            '<div class="button__inner _last_yes"></div>' +
            '</div>'
        );
    });
    it('should calc pos', function() {
        bt.match('button', function (ctx) {
            ctx.setContent([
                { elem: 'inner' },
                { elem: 'inner' },
                { elem: 'inner' }
            ]);
        });
        bt.match('button__inner', function(ctx) {
            ctx.setState('pos', ctx.getPosition());
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button">' +
            '<div class="button__inner _pos_1"></div>' +
            '<div class="button__inner _pos_2"></div>' +
            '<div class="button__inner _pos_3"></div>' +
            '</div>'
        );
    });
    it('should calc isFirst/isLast with array mess', function() {
        bt.match('button', function (ctx) {
            ctx.setContent([
                [ { elem: 'inner' } ],
                [ { elem: 'inner' }, [ { elem: 'inner' } ] ]
            ]);
        });
        bt.match('button__inner', function(ctx) {
            if (ctx.isFirst()) {
                ctx.setState('first', 'yes');
            }
            if (ctx.isLast()) {
                ctx.setState('last', 'yes');
            }
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button">' +
            '<div class="button__inner _first_yes"></div>' +
            '<div class="button__inner"></div>' +
            '<div class="button__inner _last_yes"></div>' +
            '</div>'
        );
    });
    it('should calc isFirst/isLast for single element', function() {
        bt.match('button', function (ctx) {
            ctx.setContent({ elem: 'inner' });
        });
        bt.match('button__inner', function(ctx) {
            if (ctx.isFirst()) {
                ctx.setState('first', 'yes');
            }
            if (ctx.isLast()) {
                ctx.setState('last', 'yes');
            }
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button">' +
            '<div class="button__inner _first_yes _last_yes"></div>' +
            '</div>'
        );
    });
});
