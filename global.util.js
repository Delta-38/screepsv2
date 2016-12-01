/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('global.util');
 * mod.thing == 'a thing'; // true
 */

var globalUtil = {
    isUndefined:function(obj){
        return obj === undefined;
    }
};

module.exports = globalUtil;