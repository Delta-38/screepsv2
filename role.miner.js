/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */
var roleMiner = {

    //Basic Logic. Get Close to a source
    //Harvest
    //Transfer to nearest container
    //Repeat
    minerMemory:function(){
        return {role: 'miner'};
    },
    updateQuota:function(creep,harvested){
        //creep.room.memory.harvestQuota = 5;
        if(harvested<=0){
            return;
        }
        if(creep.room.memory.harvestQuota === undefined || creep.room.memory.harvestQuota == null){
            creep.room.memory.harvestQuota = 0;
        }
        creep.room.memory.harvestQuota = harvested + creep.room.memory.harvestQuota;
        //creep.room.memory.harvestQuota =  creep.room.memory.harvestQuota + harvest;
        creep.say(creep.room.memory.harvestQuota);
    },
    run: function (creep) { //TODO CHeck to see if this is optimized and if it can be merged with remote miner through subRole or operation Modes
        //TODO Refactor, contains old dead code!
        //creep.log("\n\n\n\n"+creep.linkNear());
        //var cl = creep.pos.findClosestByRange(creep.linkNear());
        //creep.log('\n\n\n\n\nLogging: '+cl+"\n\n\n\n\n");

        var remoteMining = creep.memory.remoteMining;
        if (remoteMining) {
            remoteMining = remoteMining; //Game.getObjectById(remoteMining);
        }
        var dest = creep.memory.dest;
        var flag = creep.memory.flagName;
        if(flag){
            creep.setInFlagMemory(flag,"creeps");
        }
        var destReached = creep.memory.destReached;
        var source = creep.memory.sourceInUse != null ? Game.getObjectById(creep.memory.sourceInUse) : null;
        var container = creep.memory.container != null ? Game.getObjectById(creep.memory.container) : null;
        if (!destReached) {



            var t = null;
            if (remoteMining) {
                t = remoteMining;
                t = creep.pos.findClosestByPath(FIND_SOURCES); //RECHECK THIS LOGIC
            }else if(dest){
                t = new RoomPosition(dest.x,dest.y,dest.roomName);
                t = t.findClosestByPath(FIND_SOURCES);
            } else {
                t = creep.pos.findClosestByPath(FIND_SOURCES);
            }
            var err = 0;
            if ((err = creep.harvest(t)) == 0) {
                creep.say('RRR');
                creep.memory.destReached = true;
                creep.memory.sourceInUse = t.id;
            } else {
                creep.say('D-GtoW');


                if (remoteMining) {
                    creep.log(creep.moveTo(Game.flags["HarvestRoom"]))
                } else {
                    creep.log(creep.moveTo(t));
                }

            }
            creep.log("Miner "+creep.name+"error state? :" + err);
        } else if (destReached && source != null) {
            if (creep.carry.energy < creep.carryCapacity) {//&& source.energy>0){

                //creep.log('Harvesting Mine');
                if (creep.harvest(source) == 0) {
                    creep.say('RRR',true);
                    var cap = creep.getActiveBodyparts(WORK)*2;
                    var actualMined = source.energy - cap > 0 ? cap : source.energy;
                    this.updateQuota(creep, actualMined);
                } else {
                    //creep.say('error');
                }
            } else {
                creep.log('RemoteMining? '+remoteMining);
                if (!remoteMining) {
                    try{
                        if(creep.room.controller.my){
                            creep.log('\n\n\n\nRoom Has Controller');
                            var a = creep.linkNear();
                            if(a){
                                creep.log('Creep: '+creep.name+" linkNear: "+a);
                                //var cl = creep.pos.findClosestByRange(a);
                                var r = creep.transfer(a,RESOURCE_ENERGY);
                                creep.say("Unloading!"+r+"!");
                                if(r == OK){
                                    return;
                                }
                            }
                        }
                    }catch(err){
                        Game.notify('An error occurred in the ferry link transfer object',5);
                    }

                    if (container == null) {
                        container = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: (structure) => {return structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity}});
                        creep.memory.container = container;
                    }
                    if (container == null) {
                        creep.drop(RESOURCE_ENERGY, creep.carry.energy);
                        //Game.notify('I\'m miner:'+creep.name+' I can\' find a container near my source. Help',5);
                        creep.say('No Container help');
                    } else {
                        var tr = creep.transfer(container, RESOURCE_ENERGY);
                        if(tr<0){
                            //if(tr == ERR_FULL){
                            creep.drop(RESOURCE_ENERGY);
                            //TODO Transfer getClosestLink Function to creep prototype.
                            //}
                        }

                        /*                        if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                         // Game.notify('I\'m a miner, I can\' transfer energy to my container, help!');
                         } else {

                         }*/
                    }

                } else {
                    creep.drop(RESOURCE_ENERGY);
                }

            }
        } else {
            creep.say('OOPS');
        }

    }

};


module.exports = roleMiner;