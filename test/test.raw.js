var BT = require('../lib/bt');
require('chai').should();

describe('raw', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should escape content', function() {
        bt.match('button', function(ctx) {
            ctx.setContent('<text>');
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button">&lt;text&gt;</div>'
        );
    });
    it('should escape array content', function() {
        bt.match('button', function(ctx) {
            ctx.setContent([
                '<text1>',
                '<text2>'
            ]);
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button">&lt;text1&gt;&lt;text2&gt;</div>'
        );
    });
    it('should not escape raw content', function() {
        bt.match('button', function(ctx) {
            ctx.setContent({raw: '<text>'});
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button"><text></div>'
        );
    });
    it('should not escape raw array item', function() {
        bt.match('button', function(ctx) {
            ctx.setContent([
                {raw: '<text1>'},
                '<text2>'
            ]);
        });
        bt.apply({ block: 'button' }).should.equal(
            '<div class="button" data-block="button"><text1>&lt;text2&gt;</div>'
        );
    });
});
