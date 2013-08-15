var BT = require('../lib/bt');
require('chai').should();

describe('ctx.getTag() / ctx.setTag()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should not return tag value', function() {
        bt.match('button', function(ctx) {
            (ctx.getTag() === undefined).should.equal(true);
        });
        bt.apply({ block: 'button', tag: 'button' });
    });
    it('should set html tag', function() {
        bt.match('button', function(ctx) {
            ctx.setTag('button');
        });
        bt.apply({ block: 'button' }).should.equal('<button class="button" data-block="button"></button>');
    });
});
