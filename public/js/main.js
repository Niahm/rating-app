/*jslint devel: false, browser: true, passfail: true, nomen: true, maxerr: 50, indent: 4 */
/*global seajs */
seajs.config({
    alias : {
        'jquery' : 'jquery/1.7.1/jquery',
        'json' : 'json/1.0.1/json',
        'es5-safe' : 'es5-safe/0.9.2/es5-safe',
        'underscore' : 'underscore/1.2.3/underscore',
        'mustache' : 'mustache/0.4.0/mustache',
        'backbone' : 'backbone/1.9.1/backbone',
        'moment' : 'moment/1.3.0/moment'
    },

    preload : [
        Function.prototype.bind ? '' : 'es5-safe',
        this.JSON ? '' : 'json'
    ],

    debug : 'false'
});
