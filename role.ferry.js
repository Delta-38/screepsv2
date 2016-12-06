/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.ferry');
 * mod.thing == 'a thing'; // true
 */
var util = require('utility');
var roleFerry = {

    run: function (creep) {
        try {
            if(creep.swapIfRequired()){
                console.log("Creep: "+creep.name+" at: "+creep.pos+" swapping as required");
                return;
            }
            var remotePickup = creep.memory.remotePickup;
            var remoteBase = creep.memory.remoteBase;
            var loading = creep.memory.loading;
            var toBase = creep.memory.toBase;
            var reuseVal = 10;
            this.setToMem(creep);
            var hostiles = roomMemory.getHostilesInRoom(creep.room);
            if(creep.shouldFlee(hostiles)){
                creep.flee(hostiles);
                return;
            }
            
            
            if (remotePickup && remoteBase) {
                remotePickup = creep.memory.remotePickup;
                remoteBase = Game.getObjectById(remoteBase);
            } else if (remotePickup && !remoteBase) {
                var containers = creep.room.storage;
                if(!containers){
                    containers = creep.room.find( FIND_STRUCTURES, {filter: (user) => { return (user.structureType == STRUCTURE_CONTAINER || user.structureType == STRUCTURE_STORAGE )}});
                     console.log(JSON.stringify(containers));
                remotePickup = Game.getObjectById(remotePickup);

                creep.memory.remoteBase = containers[0].id;
                remoteBase = containers[0];
                }else{
                     creep.memory.remoteBase = containers.id;
                remoteBase = containers;
                }
               
//            creep.memory.remoteBase = creep.pos.findClosestByPath(STRUCTURE_STORAGE);
                //remoteBase = creep.memory.remoteBase;
            } else {
                //CONVENTIONAL ORIENTATION
            }    // IN ORDER : FIND DROPPED ENERGY
            // FIND CONTAINER 

            //2 STATES LOADING UNTIL FULL UNLOADING UNTIL EMPTY
            if(creep.carry.energy == 0){
                creep.memory.loading = true;
                loading = true;
                toBase = false;
            }else if(creep.carry.energy == creep.carryCapacity){
                creep.memory.toBase = true;
                loading = false;
                toBase = true;
                
            }


/*
            if (creep.carry.energy < creep.carryCapacity) {
                creep.memory.loading = true;
                loading = creep.memory.loading;
            }
*/
            if (loading) {
                //console.log('HERE GOING'+creep.name);
                var load  = 0;
                for(var r in creep.carry){
                    load += creep.carry[r] ? creep.carry[r] : 0;
                }
                if (load < creep.carryCapacity) {
                    toBase = false;
                    //console.log('HERE GOING1'+creep.name);
                    var destination = remotePickup;
                    if (!destination) {
                        console.log('No Destination: looking for dropped energy' + creep.name + ' ' + destination);
                        //CONVENTIONAL CONTAINER
                        var dropped = util.getDroppedEnergy(creep);
                        if (dropped) {
                            destination = creep.pos.findClosestByRange(dropped);
                            if (creep.pickup(destination) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(destination);
                            }
                        } else {
                            destination = util.getLocalContainers(creep, false);
                            if (creep.withdraw(destination, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(destination);
                            }
                        }


                    } else {
                       // console.log('HERE GOING3'+creep.name);
                        if (creep.pos.isNearTo(new RoomPosition(destination.x, destination.y, destination.roomName))) {
                            var res = creep.pickup(creep.pos.findClosestByRange(FIND_DROPPED_ENERGY));
                            if(res!=0){
                                console.log('HERE GOING3'+creep.name+' pickup res:'+res);
                        

                            }
                            var r = creep.pos.findInRange(FIND_STRUCTURES,1, {filter: (s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE });
                            console.log('HERE GOING3'+creep.name+' structs in range:'+JSON.stringify(r));
                        
                            if(r && r.length){
                                creep.withdraw(r[0],RESOURCE_ENERGY);
                            
                                
                            }

                            //   console.log('HERE GOING3'+creep.name+'res'+res);
                        } else {
                            var moveRes = creep.moveTo(new RoomPosition(destination.x, destination.y, destination.roomName), {reusePath: reuseVal});
                            var r = creep.pos.findInRange(FIND_DROPPED_ENERGY,1);
                            if(r && r.length){
                                creep.pickup(r[0]);
                            }
                            //console.log('Creep '+creep.name+'Going: '+JSON.stringify(destination)+':'+moveRes);
                        }
                    }
                } else {
                    creep.memory.loading = false;
                    toBase = true;
                }
            } else {
                toBase = true;
            }

            if (toBase) {
                //console.log('HERE');
                if (!remoteBase && !remotePickup) {
                    //console.log('HERE1');
                    var rem = util.getLocalContainers(creep);

                    remoteBase = creep.pos.findClosestByRange(rem);
                } else if (!remoteBase) {
                    //console.log('HERE2');
                    if(creep.room.storage!=null){
                        remoteBase = creep.room.storage;
                    }
/*                    if ((tertiaryUsers = creep.room.find(FIND_STRUCTURES, {filter: (user) => {return (user.structureType == STRUCTURE_STORAGE) }}))!= null && tertiaryUsers.length > 0 )
                    {
                        //console.log('Tertiary: '+JSON.stringify(tertiaryUsers)+'.');
                        remoteBase = tertiaryUsers[0];
                    }*/
                }
                try{
                if(creep.room.controller && creep.room.controller.my){
                    var a = creep.linkNear();
                    if(a){
                        if((a.energyCapacity - a.energy)> 0 /*= creep.carry.energy*/){
                            //var cl = creep.pos.findClosestByRange(a);
                            creep.say(creep.transfer(a,RESOURCE_ENERGY));
                        }else{
                            //Game.notify('Creep '+creep.name+' did not unload: aCap:'+a.energyCapacity+' a.En:'+a.energy+' creep.carry:'+creep.carry);
                        }
                        
                    }
                }
                }catch(err){
                    Game.notify('An error occurred in the ferry link transfer object'+err,5);
                }
                if (creep.pos.isNearTo(remoteBase)) {
                    creep.transfer(remoteBase, RESOURCE_ENERGY);
                    
                } else {
                    creep.moveTo(remoteBase, {reusePath: reuseVal});
                }
            }

            // IF FULL GO TO TARGETS


        } catch (err) {
            console.log('Error in ferry:\n' + err + '\n\n');


        }

        //TODO Try to make this the first self running module
    },

    setToMem:function(creep){
        var remoteFlagName = creep.memory.remoteFlag;
        if(remoteFlagName){
            creep.setInFlagMemory(remoteFlagName,"ferries");
        }else{
            console.log("Creep:"+creep.name+" remoteFlag not set");
        }
    }



};

module.exports = roleFerry;