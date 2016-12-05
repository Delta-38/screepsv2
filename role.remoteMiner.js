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
    
    run:function(creep){
       try{
        creep.say('RRRR',true);
        var remoteMining = creep.memory.remoteMiningFlag;
        if(remoteMining){
            if(remoteMining && (remoteMining = Game.flags[remoteMining])){
                //console.log('Remining'+JSON.stringify(remoteMining))
            }
            remoteMining = remoteMining; //Game.getObjectById(remoteMining);
        }
        var destReached = creep.memory.destReached;
        var source = creep.memory.sourceInUse != null ? Game.getObjectById(creep.memory.sourceInUse) : null;
        var container = creep.memory.container != null ? Game.getObjectById(creep.memory.container) : null;
        var cap = creep.getActiveBodyparts(WORK)*2;

        if(!destReached){
            if(remoteMining){
             t = remoteMining;
             //console.log(JSON.stringify(t));
             //console.log('Remining'+JSON.stringify(t));
             
              if(t.pos.x == creep.pos.x && t.pos.y == creep.pos.y && creep.pos.roomName == t.pos.roomName){
                 t = creep.pos.findClosestByPath(FIND_SOURCES); //RECHECK THIS LOGIC
             }
            }else{
                t = creep.pos.findClosestByRange(FIND_SOURCES);
            }
            var err = 0;
            if((err = creep.harvest(t))==0){
                //creep.say('H'+cap);
                var actualMined = t.energy - cap > 0 ? cap : t.energy;
                this.updateQuota(creep, actualMined);
                creep.memory.destReached = true;
                creep.memory.sourceInUse = t.id;
                console.log('Completed mining');
            }else{
                creep.say('D-GtoW2');
                if(remoteMining){
                    var err = creep.moveTo(t, {reusePath : 10});
                    if(err!=0){
                        /*
                        if(err == ERR_NO_PATH){ //TODO This function needs some debugging
                            console.log("A swap would be nice."+t);
                            var p = creep.room.findPath(creep.pos,t.pos,{ignoreCreeps:true});
                            console.log("Got a path "+p);
                            if(p && p.length){
                                var nextStep = p[0];
                                console.log('Path p0'+JSON.stringify(nextStep));
                                if(nextStep){
                                    var res = creep.room.lookForAt(LOOK_CREEPS,new RoomPosition(nextStep.x,nextStep.y,creep.pos.roomName));
                                    if(res && res.length){
                                        var roadBlockingCreep = res[0];
                                        console.log('Found Creep '+roadBlockingCreep);
                                        roadBlockingCreep.memory.swapRequired = creep.pos;
                                        roadBlockingCreep.moveTo(creep.pos);
                                        var swapRes = creep.moveTo(nextStep);
                                        Game.notify("Swap Attempted At "+creep.pos+ " check result");
                                    }
                                }
                            }
                        }*/
                    }
                    console.log(creep.moveTo(t,{reusePath: 10}));
                }else{
                   console.log( creep.moveTo(t,{reusePath: 10}));
                }
                    
            }       
            console.log("RemoteMiner "+creep.name+"error state: "+err);
        }else if(destReached && source!=null){
            creep.harvest(source)==0; //TODO CREEP MIGHT NOT HAVE CARRY!!!
            //creep.say('H'+cap);
             var cap = creep.getActiveBodyparts(WORK)*2;
             var actualMined = source.energy - cap > 0 ? cap : source.energy;
             this.updateQuota(creep, actualMined);

            if(creep.carry.energy < creep.carryCapacity ){//&& source.energy>0){
                //console.log('Harvesting Mine');
               if(creep.harvest(source)==0){
                    //creep.say('H'+cap);
                    //creep.say('16Tons');
                }else{
                    creep.say('error');
                }
            }else{
                if(!remoteMining){
                                     

                    if(container==null){
                        container = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store)<structure.storeCapacity}});
                        creep.memory.container = container;
                    }
                    if(container==null){
                        creep.drop(RESOURCE_ENERGY,creep.carry.energy);
                        //Game.notify('I\'m miner:'+creep.name+' I can\' find a container near my source. Help',5);
                        creep.say('No Container help');
                    }else{
                        if(creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                           // Game.notify('I\'m a miner, I can\' transfer energy to my container, help!');
                        }else{
                            
                        }
                    }
                    
                }else{
                    
                    creep.drop(RESOURCE_ENERGY);
                }
                
            }
        }else{
            creep.say('OOPS');
        }
    }catch(error){
        console.log('Remote Miner error:'+error+' st:'+error.stack+' creepName:'+creep.name+' mem:'+JSON.stringify(creep.memory));
        Game.notify('Remote Miner error:'+error+' creepName:'+creep.name+' mem:'+JSON.stringify(creep.memory));
    }
    }
    
}


module.exports = roleMiner;