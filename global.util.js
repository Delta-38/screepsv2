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
    },


    longEmail:function(report,interval){
        try{
            var length = report.length;
            if(length<500){
                Game.notify(report,interval);
            }else{
                var tmpString = '';
                var index = 0;
                while(index<length){
                    var newVal = index+500;
                    tmpString = report.substring(index,newVal);
                    Game.notify(tmpString,interval);
                    index = newVal;
                }
            }


        }catch(err){
            Game.notify('Error in splitReport functoin:'+report,10);

        }
    }


};

module.exports = globalUtil;