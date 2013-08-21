var BT = require('../lib/bt');
require('chai').should();

describe('options', function() {
    describe('jsAttr', function() {
        var bt;
        beforeEach(function() {
            bt = new BT();
        });
        it('should render options', function() {
            bt.match('button', function (ctx) {
                ctx.setInitOption('x', 1);
            });
            bt.apply({ block: 'button' }).should.equal(
                '<div class="button" data-block="button" data-options="{&quot;options&quot;:{&quot;x&quot;:1}}">' +
                '</div>'
            );
        });
    });
});
