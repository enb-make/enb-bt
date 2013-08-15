var BT = require('../lib/bt');
require('chai').should();

describe('ctx.applyTemplates()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should apply templates new mod', function() {
        bt.match('button', function(ctx) {
            ctx.applyTemplates();
            ctx.setTag('span');
        });
        bt.match('button', function(ctx) {
            ctx.setTag('button');
        });
        bt.apply({ block: 'button' }).should.equal(
            '<span class="button" data-block="button"></span>'
        );
    });
});
