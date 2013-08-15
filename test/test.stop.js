var BT = require('../lib/bt');
require('chai').should();

describe('ctx.stop()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should prevent base matching', function() {
        bt.match('button', function(ctx) {
            ctx.setTag('button');
        });
        bt.match('button', function(ctx) {
            ctx.setTag('span');
            ctx.stop();
        });
        bt.apply({ block: 'button' }).should.equal(
            '<span class="button" data-block="button"></span>'
        );
    });
});
