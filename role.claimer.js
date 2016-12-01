/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.scout');
 * mod.thing == 'a thing'; // true
 */
//TODO Test me in the public realm first.
var util = require('utility');
var roleClaimer = {
    run: function (creep) {
        try {
            //var taskType = creep.memory.task;
             var hostiles = roomMemory.getHostilesInRoom(creep.room);
            if(creep.shouldFlee(hostiles)){
                creep.flee(hostiles);
                return;
            }
            var dest = creep.memory.dest;
            //this.achieveVision(creep,dest);
            this.goToLocation(creep,dest);
        } catch (err) {
            console.log('\n\nClaimer Error: ' + err + '\n\n');
            Game.notify('Error in Claimer module: Current Position: ' + creep.pos + ' Current Destination: ' + dest + 'Error: ' + err);
        }
    },

    goToLocation: function (creep, dest) {
        var destination = new RoomPosition(dest.x, dest.y, dest.roomName);
        // if (creep.room.roomName == destination.roomName) {
        //if (creep.room.roomName == destination.roomName) {
        if(creep.pos.isNearTo(destination)){
            var task = creep.memory.task;
        //    console.log('Reserve Creep: task:'+task);
            if (task) {
                if (task == 'claim') {
                    creep.claimController(creep.room.controller);
                }else if (task == 'reserve') {
                    console.log('Reserve Controller Action:'+creep.reserveController(creep.room.controller))
                    creep.say('Mine!',true);
                   // creep.reserveController(creep.room.controller);
                } else if (task = 'attack') {
                    creep.attackController(creep.room.controller);
                } else {
                    creep.say('wtf');
                }
            }

            if (this.avoidingHostiles(creep)) {
                creep.say('Please don\'t hurt me!', true);
            } else if (creep.pos == destination) {
                creep.say('Hi There!', true);
            } else {
                creep.moveTo(destination);
            }
        }else
        {
          //  console.log('Stille reaching towards Destination'+creep.pos+ ' dest:'+destination);
            creep.moveTo(destination, {reusePath: 50});
        }
    },


    achieveVision:function (creep, dest) {
        var destination = new RoomPosition(dest.x, dest.y, dest.roomName);
        if (creep.room.roomName == destination.roomName) {
            if (this.avoidingHostiles(creep)) {
                creep.say('Please don\'t hurt me!', true);
            } else if (creep.pos == destination) {
                creep.say('Hi There!', true);
            } else {
                this.moveTo(destination);
            }
        } else {
            creep.moveTo(destination, {reusePath: 50});
        }
    },
    avoidingHostiles:function (creep) {
        var badCreeps = util.findHostileCreeps(creep.room);
        if (badCreeps && badCreeps.length) {
            creep.say('Bad Creeps!!', true);
            var closestCreep = creep.pos.findClosestByPath(badCreeps);
            var rangeTo = creep.pos.getRangeTo(closestCreep);
            console.log('Creep Scout Logic Test:' + JSON.stringify(closestCreep) + JSON.stringify(rangeTo));
            if (rangeTo < 4) {
                console.log('Moving away');
                var oppositeDirection = util.getOppositeDirection(creep, closestCreep);
                creep.move(oppositeDirection);
            }
        } else {
            return false;
        }


    }
}
module.exports = roleClaimer;