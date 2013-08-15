var BT = require('../lib/bt');
require('chai').should();

describe('ctx.getParam()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should return param', function() {
        bt.match('button', function(ctx) {
            ctx.getParam('type').should.equal('button');
        });
        bt.apply({ block: 'button', type: 'button' });
    });
});
