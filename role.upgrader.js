var utility = require('utility');
var roleUpgrader = {
    findDroppedEnergy: function (creep) {
        return creep.room.find(FIND_DROPPED_ENERGY);
    },

    upgraderMemory:function(){
        return { role: 'upgrader'};
    },
    sneakRun: function (creep) {
        var flag = creep.memory.flagName;
        flag = Game.flags[flag];
        if(flag){
            if(!creep.pos.isNearTo(flag.pos)){
                creep.say('Being Sneaky');
                creep.moveTo(flag.pos);
            }else{
                creep.upgradeController(creep.room.controller);
            }
        }else{
            creep.log('Upgrader Sneaky conf problem'+JSON.stringify(creep.memory));
        }
    },
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.carry.energy == 0) {
            creep.memory.loading = true;
        }
        if (creep.carry.energy < creep.carryCapacity && creep.memory.loading) {
            var droppedEnergy ;//= this.findDroppedEnergy(creep);
            var dest = null;
            var links = null;
            var closestLink = null;
            //var hostiles = utility.findHostileCreeps(creep.room);
           // creep.log('Upgrader Dropped Eneerrgy:' + droppedEnergy + ' ' + hostiles);
            if(creep.room.controller.level>=5){
                links = roomMemory.getLocalLinks(creep.room);    
                closestLink = creep.pos.findClosestByPath(links);
            }
            
           // links = creep.room.controller.level >= 6 ? roomMemory.getLocalLinks(creep.room) : null;
            //links = roomMemory.getLocalLinks(creep.room);
           
            if(closestLink && creep.pos.getRangeTo(closestLink) <5 && closestLink.energy>0){
                dest = closestLink;
                //creep.say("LinkMe");
                var err = creep.withdraw(closestLink,RESOURCE_ENERGY);
                //Game.notify('Upgrader Creep:'+creep.name+' err:'+err+' '+JSON.stringify(closestLink));
                if(err!=0){
                    creep.say("LinkErr:"+err);
                
                    if(err == ERR_NOT_IN_RANGE){
                        creep.moveTo(dest);
                    }
                   //creep.log('Upgrader LINKME'+err+' '+JSON.stringify(closestLink));
                }/*
                if(creep.withdraw(closestEnergy,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                   creep.moveTo(dest); 
                }*/
            }else if (droppedEnergy != null && droppedEnergy.length > 0) {//&& !utility.findHostileCreeps(creep.room)){
                dest = creep.pos.findClosestByPath(droppedEnergy);
                //creep.say('Pickup'+JSON.stringify(droppedEnergy));
                //creep.log('Pickup'+JSON.stringify(droppedEnergy));
                if (creep.pickup(dest) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dest);
                }
            } else {
                var miners = null;
            //TODO Rewrite filter functions in utility or somewhere
                //TODO Make Utility global //SHOULD USE A GET LOCAL STORAGE USING CACHE
                var containers = creep.room.find(FIND_STRUCTURES, {filter: (container) => {return (container.structureType == STRUCTURE_CONTAINER || container.structureType == STRUCTURE_STORAGE) && container.store[RESOURCE_ENERGY] > 0}});
                /*var fullest = containers.sort((a,b)=>{ _.sum(a.store)>_.sum(b.store)});
                 creep.log('Fullest container'+JSON.stringify(fullest[0]));*/
                var dest = null;
                creep.memory.loading = true;
                if (containers && containers.length) {
                    dest = creep.pos.findClosestByPath(containers);
                    if (dest) {
                        // creep.log('COnt: '+dest+ ' en: '+dest.energy);
                        if (creep.pos.isNearTo(dest)) {
                            creep.withdraw(dest, RESOURCE_ENERGY);
                        } else {
                            creep.moveTo(dest);
                        }
                    } else {
                        creep.say('No C');
                    }
                }else{
                    dest = creep.pos.findClosestByRange(roomMemory.getLocalSources(creep.room)); //ROOM SOURCES SHOULD BE CACHED
                    if (dest) {
                        // creep.log('COnt: '+dest+ ' en: '+dest.energy);
                        if (creep.pos.isNearTo(dest)) {
                            creep.harvest(dest, RESOURCE_ENERGY);
                        } else {
                            creep.moveTo(dest);
                        }
                    } else {
                        creep.say('No C');
                    }
                    
                }
            }
        } else {
            var subRole = creep.memory.subRole;
            if(subRole == 'sneaky'){
                this.sneakRun(creep);
            }else {

                var controller = creep.room.controller;
                if (creep.pos.inRangeTo(controller, 3)) {
                    creep.say('UpUpUp!',true);
                    creep.upgradeController(controller);
                    creep.memory.loading = false;
                } else {
                    creep.say('M->Upg');
                    creep.moveTo(controller);
                    creep.memory.loading = false;

                }
            }
        }
    }
};

module.exports = roleUpgrader;