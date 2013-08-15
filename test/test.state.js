var BT = require('../lib/bt');
require('chai').should();

describe('ctx.getState()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should return state', function() {
        bt.match('component', function(ctx) {
            ctx.setState('focused', 'yes');
            ctx.getState('focused').should.equal('yes');
        });
        bt.apply({ block: 'component' });
    });
});

describe('ctx.setState()', function() {
    var bt;
    beforeEach(function() {
        bt = new BT();
    });
    it('should return state', function() {
        bt.match('component', function(ctx) {
            ctx.setState('focused', 'yes');
            ctx.getState('focused').should.equal('yes');
        });
        bt.apply({ block: 'component', states: {type: 'button'} });
    });
    it('should set bool state', function() {
        bt.match('component', function(ctx) {
            ctx.setState('focused', 'yes');
            ctx.getState('focused').should.equal('yes');
        });
        bt.apply({ block: 'component' }).should.equal(
            '<div class="component focused_yes" data-block="component"></div>'
        );
    });
    it('should set string state', function() {
        bt.match('component', function(ctx) {
            ctx.setState('is-focused');
            ctx.getState('is-focused').should.equal(true);
        });
        bt.apply({ block: 'component' }).should.equal(
            '<div class="component is-focused" data-block="component"></div>'
        );
    });
});
