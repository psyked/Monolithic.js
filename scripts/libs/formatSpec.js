describe('Check the formatting', function() {
    var format = require('./format');

    it('has the api', function() {
        expect(typeof(format)).toBe('function');
    });

    it('returns a string', function() {
        expect(typeof(format('var that = this;'))).toBe('string');
    });

    it('returns the same string we give it', function() {
        expect(format('var that = this;')).toBe('var that = this;');
    });

    it('kills whitespace in strings we give it', function() {
        expect(format('var that  =  this;')).toBe('var that = this;');
        expect(format('var that  =  this;')).not.toBe('var that  =  this;');
    });
});
