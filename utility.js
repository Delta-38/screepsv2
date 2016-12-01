/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('utility');
 * mod.thing == 'a thing'; // true
 */

var utility = {
    
    
    objectArrayToIdArray:function(obArray){
       var ret = new Array();
       for(var o in obArray ){
           ret[o.id] = o.id;
       }
       return ret;
    },
    idArrayToObjectArray:function(idArray){
        var ret = new Array();
       for(var v in idArray ){
           ret[v.id] = Game.getObjectById(v.id);
       }
       return ret;
    },
    goToSource:function(creep){
        
        
        creep.say('AAAA');
    },
    getOppositeDirection:function(creep,target){
        var dir = creep.pos.getDirectionTo(target);
        switch(dir){
            case TOP:
                return BOTTOM;
            case TOP_RIGHT:
                return BOTTOM_LEFT;
            case RIGHT:
                return LEFT;
            case BOTTOM_RIGHT:
                return TOP_LEFT;
            case BOTTOM:
                return TOP;
            case BOTTOM_LEFT:
                return TOP_RIGHT;
            case LEFT:
                return RIGHT;
            case TOP_LEFT:
                return BOTTOM_RIGHT;
            defaut:
                return TOP;
            
        }
        
        
        
    },
    getWContainer:function(){
        
    },
    getDContainer:function(){
        
    },
    
    getNextBuildOrder :function( ){
        
    },
    getMostUrgentRepair:function(){
        
    },
    
    storeSources:function(creep){
        var source = creep.memory.sourceInUse != null ? Game.getObjectById(creep.memory.sourceInUse) : null;
    },
    getLocalSources:function(creep){
        var roomName = creep.room.name;
        var closest = creep.pos.findClosestByRange(FIND_SOURCES);
         
        return creep.pos.findClosestByRange(FIND_SOURCES);
    },
    getNearestController:function(creep){
        var controllers = new Array();
        for(var room in Game.rooms){
            
            var controller = Game.rooms[room].controller;
            //console.log('Get NearestController r:'+room+'c:'+controller);
            if(controller && controller.my){
                controllers.push(controller);
            }
        }
        //return '577b944b0f9d51615fa496db';
        var res = creep.pos.findClosestByRange(controllers);
        //console.log('GetNearestController res:'+res);
        return res;
        
    },
    storeRoomSourceInMemory:function(roomName,sources){
        if(!Memory.roomNames){
            Memory.roomNames = new Array();
            this.storeRoomSourceInMemory(roomName,sources);
            
        }else if(!Memory.roomNames[roomName]){
            Memory.roomNames[roomName] = new Array();
            this.storeRoomSourceInMemory(roomName,sources);
        }else{
            Memory.roomNames[roomName]['sources']=sources;
        }
        
    },
    getSourcesForRoom:function(roomName){
        var storedSourcesKey = Memory.storedSources;
        if(storedSourcesKey!=null){
            if(storedSourcesKey[roomName]!=null){
               return this.idArrayToObjectArray(storedSourcesKey[roomName]);
            }else{
            //Populate
            //console.log('RoomName:'+roomName);
            var roomSources = Game.rooms[roomName].find(FIND_SOURCES);
            Memory.storedSources[roomName] = 'Hello!';
            //Memory.storedSources[roomName] = this.objectArrayToIdArray(roomSources);
            //console.log('Sources FOund for room:'+roomName+' :'+JSON.stringify(roomSources));
                return roomSources;
            }
        }else{
            Memory.storedSources = new Array();
            getSourcesForRoom(roomName);
        }
    },
    getNearestDroppedEnergy:function(creep){
        var droppedEnergy = this.getDroppedEnergy(creep);
        return droppedEnergy ? creep.pos.findClosestByRange(droppedEnergy) : null;
    },
    getDroppedEnergy:function(creep){
       return creep.room.find(FIND_DROPPED_ENERGY);  
    },
    getNearestSource:function(creep){
       var sources= this.getNearestSources(creep);
       return creep.pos.findClosestByPath(sources);
    },
    getNearestSources:function(creep){
        return creep.pos.findClosestByRange(FIND_SOURCES);
    },
    getLocalContainers:function(creep, allowEmpty){
        if(allowEmpty){
            return  creep.room.find( FIND_STRUCTURES, {filter: (container) => { return (container.structureType == STRUCTURE_CONTAINER)}});
        }else{
            return  creep.room.find( FIND_STRUCTURES, {filter: (container) => { return (container.structureType == STRUCTURE_CONTAINER) && (container.store[RESOURCE_ENERGY]>0)}});
        }
    },
    getNonEmptyStorage:function(creep){
      	 var sources = creep.room.find( FIND_STRUCTURES, {filter: (container) => { return (container.structureType == STRUCTURE_STORAGE) && (container.store[RESOURCE_ENERGY]>0)}});
         return sources;
    },
    getNearestStorage:function(creep){
        return  creep.room.find( FIND_STRUCTURES, {filter: (container) => { return (container.structureType == STRUCTURE_STORAGE)}});
    },
    getNearestEnergy:function(creep){
         var res = creep.room.find( FIND_STRUCTURES, {filter: (container) => { return (container.structureType == STRUCTURE_STORAGE || container.structureType == STRUCTURE_CONTAINER ) && (container.store[RESOURCE_ENERGY]>0)}});
         return creep.pos.findClosestByRange(res);
    },
    findHostileCreeps:function(room){
        try{
            return hostiles = room.find(FIND_HOSTILE_CREEPS);
        }catch(err){
            console.log('Error in find hostile creeps'+err);
            return new Array();
            
        }
            
        },
        isMeleeCreep:function(creep){
        return creep.getActiveBodyparts(ATTACK);
    },
    isRangedCreep:function(creep){
        return creep.getActiveBodyparts(RANGED_ATTACK);
    },
    isHealersCreep:function(creep){
        return creep.getActiveBodyparts(HEAL);
    }


    
    
};

module.exports = utility;