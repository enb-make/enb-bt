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
            '<div class="button _init" data-block="button" data-init></div>'
        );
    });
});


