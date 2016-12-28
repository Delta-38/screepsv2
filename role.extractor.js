/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.extractor');
 * mod.thing == 'a thing'; // true
 */

var roleExtractor = {

    run:function(creep){
        var load = 0;
        for(var r in creep.carry){
            load += creep.carry[r] ? creep.carry[r] : 0;
        }
        var loading = creep.memory.loading;
        creep.log('Extractor: load '+load);//+JSON.stringify(creep.carry) + creep.carry.RESOURCE_UTRIUM);
        if(load < creep.carryCapacity){
            creep.memory.loading = true;
            loading = true;
            
        }else{
            creep.memory.loading = false;
            loading = false;
        }
        //creep.log('I am an extractor'+loading + (creep.carry.energy < creep.carryCapacity));
        
        if(loading){
            this.mineExtractor(creep);    
        }else{
            this.depositMinerals(creep);
        }

        
    },
    mineExtractor:function(creep){
        var extractor = creep.memory.extractor ? Game.getObjectById(creep.memory.extractor) : null;
        var mineralSource = creep.memory.mSource ? Game.getObjectById(creep.memory.mSource) : null;
        try{
            //creep.log("1");
        if(!extractor){
            //creep.log("2");
            extractor = creep.room.find(FIND_STRUCTURES, {filter: (ext) => { return (ext.structureType == STRUCTURE_EXTRACTOR)}});
            creep.memory.extractor = extractor.id;
           // creep.log('Extractor search: '+extractor);
        }
        if(extractor){
            extractor = extractor[0];
            //creep.log("3"+JSON.stringify(extractor) + 'pos'+extractor.pos);
            if(creep.pos.isNearTo(extractor)){
                 if(extractor.cooldown>0){
                    creep.say('StupidCD',true);
                 }
                 var mineral = creep.memory.mineral ? Game.getObjectById(creep.memory.mineral) : null;
                 if(!mineral){
                    mineral = creep.pos.findInRange(FIND_MINERALS,1);
                    if(mineral && mineral.length){
                        mineral = mineral[0];
                        creep.memory.mineral = mineral.id;
                    }
                 }
                 if(mineral){
                     creep.harvest(mineral);
                 }
            }else{
                creep.moveTo(extractor, { reusePath: 20});
            }
        }
        }catch(error){
            creep.log('Error in Extractor code: '+error);
            Game.notify('Error in Extractor code: '+error,10);
        }
    },
    
    depositMinerals:function(creep){
        var storage = creep.room.storage;
        if(storage){
            if(creep.pos.isNearTo(storage)){
               for(var resourceType in creep.carry) {
	                creep.transfer(storage, resourceType);
	                creep.memory.loading = false;
                }
            }else{
                creep.moveTo(storage, {reusePath:20});
            }
        }
    }
    
}


module.exports = roleExtractor;