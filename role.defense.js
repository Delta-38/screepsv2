/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.defense');
 * mod.thing == 'a thing'; // true
 */

    var utility = require('utility');
module.exports = {
    defendTheRoom:function(creep){
        var hostiles = this.findHostiles();
        if(hostiles!=null && hostiles.length>0){
            var nearestBoogie = creep.pos.findClosestByRange(hostiles);
            if(utility.isRangeCreep(creep)){
                if(creep.rangedAttack(nearestBoogie)== ERR_NOT_IN_RANGE){
                    console.log('Take that!! ');
                }else{
                    creep.moveTo(nearestBoogie);
                }
              
            }   
            if(utility.isMeleeCreep(creep)){
                if(creep.attack(nearestBoogie) == ERR_NOT_IN_RANGE){
                    creep.moveTo(nearestBoogie);
                }else{
                    
                }  
            }
            
            
        }else{
            var parking = null;// Game.flags.ParkingLot;
            if(parking!=null){
                creep.moveTo(parking);
            }
        }
        
        
    },
    findHostiles:function(creep){
        return utility.findHostileCreeps(creep.room);
    },
};














