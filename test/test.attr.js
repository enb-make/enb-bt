var BT = require('../lib/bt');
require('chai').should();

describe('ctx.getAttr()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should return attr', function() {
        bt.match('button', function(ctx) {
            ctx.setAttr('type', 'button');
            ctx.getAttr('type').should.equal('button');
        });
        bt.apply({ block: 'button' });
    });
});

describe('ctx.setAttr()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should set attr', function() {
        bt.match('button', function(ctx) {
            ctx.setAttr('type', 'button');
        });
        bt.apply({ block: 'button' }).should.equal('<div class="button" data-block="button" type="button"></div>');
    });
    it('should render non-value attrs', function() {
        bt.match('button', function(ctx) {
            ctx.setTag('button');
            ctx.setAttr('disabled', true);
        });
        bt.apply({ block: 'button' }).should.equal('<button class="button" data-block="button" disabled></button>');
    });
});
