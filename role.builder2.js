/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
     run: function(creep) {
         /*
	    if(creep.carry.energy < creep.carryCapacity) {
	        creep.say('fetching');
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }else{
            creep.say('upgrading');
            if(creep.transfer(Room.controller) == ERR_NOT_IN_RANGE){
                creep.moveTo(Room.controller);    
            }
        }*/
        
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }
	    if(creep.carry.energy == creep.carryCapacity){
	        creep.memory.loading = false;
	    }
/*	    console.log('Untangle: '+creep.memory.untangle);
	    if(creep.memory.untangle){
	        var t = creep.moveTo(Game.getObjectById(creep.memory.untangle));
	        var l = creep.memory.untangleD;
	        console.log('Detected stuck');
	        if(l==0){
	            creep.memory.untangle = null;
	            creep.memory.untangleD = 0;
	        }else{
	            creep.memory.untangleD = l != null ? l-1 : 0;
	        }
	        return;
	    }else{
	        
	    }
*/	    
        var moveRes = 0;
	    if(creep.memory.building) {
	        //creep.say('Building');
	        var targetWallStrength = 15000;
	        var targetRampartStrength = 470000;
             var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
//	       
	        var nextNearlyDone = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return structure.progress}});
	        var allRepairs = creep.room.find( FIND_STRUCTURES, {filter : (structure) => 
	        {return structure.structureType!= STRUCTURE_WALL && structure.hits<structure.hitsMax || 
	        ((structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART ) && structure.hits < targetWallStrength)}});
	        var urgentRepairs = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) && (structure.hits) < (structure.hitsMax - (structure.hitsMax/10)*2) || 
                        ((structure.structureType == STRUCTURE_WALL ) && structure.hits < targetWallStrength) || ( structure.structureType == STRUCTURE_RAMPART && structure.hits < targetRampartStrength));
                    }
            });
            allRepairs.sort( (a,b) => a.hits < b.hits);
            
           // console.log(targets);
            //if(target) {
            if(urgentRepairs.length>0){
                var err = 0;
                var dest = creep.pos.findClosestByRange(urgentRepairs);
                if((err == creep.repair(/*urgentRepairs[0]*/ dest)) == ERR_NOT_IN_RANGE) {
                    
                    moveRes = creep.moveTo(dest);
                }else if(err<0){
    	            creep.memory.untangle = Game.flags.Untangle.id;
	                creep.memory.untangleD = 4;
                }   
                console.log('Say err:'+err);
                //creep.say('U-Fix');//+urgentRepairs[0].structureType);
                console.log('U-Fix'+JSON.stringify(urgentRepairs[0]));
            }else if(target){
                
                console.log('Building'+target.pos);
                if(creep.memory.target!=null){
                    var t = Game.getObjectById(creep.memory.target);
                    if(t!=null && t.progress!= t.progressTotal){
                        target = Game.getObjectById(creep.memory.target);
                        creep.say('B->'+target.structureType);
                    }else{
                        creep.memory.target = null;
                    }
                }else{
                creep.memory.target = null;
                
                var urgentConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (structure) => {
                        return ( structure.structureType == STRUCTURE_SPAWN || 
                        structure.structureType == STRUCTURE_TOWER || 
                        structure.structureType == STRUCTURE_EXTENSION || 
                        structure.structureType == STRUCTURE_CONTAINER );
                    }
                });
                urgentConstructionSites.sort ( (a,b) => (a.progressTotal / a.progress) < (b.progressTotal / b.progress) );
                if(urgentConstructionSites.length>0){
                    target = urgentConstructionSites[0];
                }else{
                    var normalConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (structure) => {
                        return ( structure.structureType == STRUCTURE_ROAD || structure.structureType == STRUCTURE_WALL );
                    }
                    });
                    normalConstructionSites.sort ( (a,b) => (a.progressTotal < b.progressTotal) && ((a.progressTotal / a.progress)> (b.progressTotal / b.progress)) );
                    if(normalConstructionSites.length>0){
                        target = normalConstructionSites[0];
                    }
                }
                    
                }
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    moveRes = creep.moveTo(target);
                }else{
                    creep.memory.target = target.id;
                } 
            }else if(allRepairs.length>0){
                creep.say('N-Fix');
                if(creep.repair(allRepairs[0]) == ERR_NOT_IN_RANGE) {
                    moveRes = creep.moveTo(allRepairs[0]);
                }
            }else{
                creep.moveTo(Game.flags.ParkingLot);
            }
	    }
	    else {
	        //creep.say('Fetch Stuff');
	            var containers = creep.room.find( FIND_STRUCTURES, {filter: (container) => { return container.structureType == STRUCTURE_CONTAINER && container.store[RESOURCE_ENERGY]>0}});
	            containers.sort((a,b) => (a.store[RESOURCE_ENERGY] > b.store[RESOURCE_ENERGY]));
    	        var dest = null;
    	        creep.memory.loading = true;
    	        if(containers!=null && containers.length>0){
    	            dest = containers[0];//creep.pos.findClosestByPath(containers);
    	            if(dest!=null){
    	                //console.log('COnt: '+dest+ ' en: '+dest.energy);
        	            if(creep.withdraw(dest, RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
        	                creep.moveTo(dest);
        	            }
    	                
    	            }else{
    	                creep.say('No C');
    	            }
    	        }else{
        	        var sources = creep.room.find(FIND_SOURCES);
                    dest = creep.pos.findClosestByRange(sources);
                    if(dest!=null){
                        //console.log('COnt: '+dest+ ' en: '+dest.energy);
                        if(creep.harvest(dest) == ERR_NOT_IN_RANGE) {
                            moveRes = creep.moveTo(dest);
                            
                        }else{
                            creep.say('H->E');
                            creep.memory.loading = true;
                        }
                        
                    }else{
                        creep.say('No E');
                    }
    	        }
	    }
	   
	    switch(moveRes){
	        case(0):{
	            //Do nothing
	            break;
	        }
	        case(-4):{
	           creep.say('I\'m being Born!');
	        }
	        case(-11):{
	             creep.say('I can\' find a path');
	        }
	        case(-2):{
	            creep.memory.untangle = Game.flags.Untangle.id;
	            creep.memory.untangleD = 10;
	            creep.moveTo(Game.flags.Untangle);
	            break;
	        }
	        default:
	            creep.say('MvErr:'+moveRes);
	           // console.log('Sono: '+creep.name+ ' bloccato verso: '+creep.moveTo(Game.flags.ParkingLot));
	            creep.memory.untangle = Game.flags.Untangle.id;
	            creep.memory.untangleD = 10;
	            console.log(creep.moveTo(Game.flags.Untangle));
	        break;
	    }
 /*       
        else if(Game.spawns.TheSpawn.energy < Game.spawns.TheSpawn.energyCapacity) {
            if(creep.transfer(Game.spawns.TheSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns.TheSpawn);
            }
        }else{
            creep.moveTo(Game.flags.ParkingLot);
            
        }
*/	}
};