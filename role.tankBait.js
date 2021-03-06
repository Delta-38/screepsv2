/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.scout');
 * mod.thing == 'a thing'; // true
 */

var util = require('utility');
var roleTankBait = {
    run:function(creep){
        try{
        //var taskType = creep.memory.task;
            var dest = creep.memory.dest;
            this.achieveVision(creep,dest);
            
        }catch(err){
            console.log('\n TankBait Error: '+err+'\n\n');
            Game.notify('Error in TankBait module: Current Position: '+creep.pos+ ' Current Destination: '+dest+'Error: '+err);
        }
    },
    amIDone:function(creep){
        if(!creep.memory.recycle){
            if(Game.time%10==0){
//                var here = creep.room.lookAt(creep.memory.dest);
                
            }
        }else{
            
        }
        
    },
    achieveVision:function(creep,dest){
        var destination = new RoomPosition(dest.x,dest.y,dest.roomName);
        if(creep.room.roomName == destination.roomName){
            if(this.avoidingHostiles(creep)){
                creep.say('Please don\'t hurt me!',true);
            }else if(creep.pos == destination){
                creep.say('Hi There!',true);
            }else{
                creep.say('TankBaiting!');
                this.moveTo(destination);
            }
        }else{
           creep.moveTo(destination,{reusePath: 50});
        }
    },
    avoidingHostiles:function(creep){
        var badCreeps = util.findHostileCreeps(creep.room);
        if(badCreeps && badCreeps.length){
            creeps.say('Bad Creeps!!',true);
            var closestCreep = creep.pos.findClosestByPath(badCreeps);
            var rangeTo = creep.pos.getRangeTo(closestCreep);
            console.log('Creep Scout Logic Test:'+JSON.stringify(closestCreep)+ JSON.stringify(rangeTo));
            if(rangeTo<4){
                console.log('Moving away');
                var oppositeDirection = util.getOppositeDirection(creep,closesCreep);
                creep.move(oppositeDirection);
            }
            
            
        }else{
            return false;
        }
        
        
    }
}
module.exports = roleScout;