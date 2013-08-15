var BT = require('../lib/bt');
require('chai').should();

describe('ctx.generateId()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should generate different ids', function() {
        bt.match('button', function(ctx) {
            ctx.generateId().should.not.equal(ctx.generateId());
        });
        bt.apply({ block: 'button' });
    });
});
