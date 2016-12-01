
var roomMemory= {
    log:function(text){
        console.log(text);
    },

    getConstructionSites: function(room){
        if(!room.memory.constructionSites)   {
            this.setConstructionSites(room);
        }
        return room.memory.constructionSites;
    },
    setConstructionSites: function (room) {
        var controller = room.controller;
        if(controller && controller.my){
            room.memory.constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        }
    },
    setUrgentRepairs: function (room) {
        var controller = room.controller;
        if(controller && controller.my){
            var c = room.find(FIND_STRUCTURES, {filter: (s) => {return ((s.structureType != STRUCTURE_WALL || s.structureType != STRUCTURE_RAMPART) && s.hits < s.hitsMax) ||
                ((s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART ) && s.hits < this.getRoomTargetWallStrength)}});
            room.memory.urgentRepairs = c;
        }
    },

    getRepairs:function(room){
        if(!room.memory.repairs){
            this.setRepairs(room);
        }
        return room.memory.repairs;
    },
    setRepairs: function (room) {
        var controller = room.controller;
        if(controller && controller.my){
            var c = room.find(FIND_MY_STRUCTURES, {filter: (s) => {return ((s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART) && s.hits < s.hitsMax
            )}});
            room.memory.repairs = c;
        }
    },

    getUrgentRepairs:function(room){
        if(!room.memory.urgentRepairs){
            this.setUrgentRepairs(room);
        }
        return room.memory.urgentRepairs;
    },


    setUrgentConstruction: function (room) {
        var controller = room.controller;
        if(controller && controller.my){
            var d = room.find(FIND_CONSTRUCTION_SITES, { filter: (structure) => { return (structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_CONTAINER)}});
            room.memory.urgentConstruction =d;

        }
    },
    getUrgentConstruction:function(room){
        if(!room.memory.urgentConstruction){
            this.setUrgentConstruction(room);
        }
        return room.memory.urgentConstruction;
    },

    getRemoteRepairs:function(room){
        if(!room.memory.remoteRepairs){
            this.setRemoteRepairs(room);
        }
        return room.memory.remoteRepairs;
    },
    setRemoteRepairs:function(room){
        var d = room.find(FIND_STRUCTURES, {filter: { structureType: STRUCTURE_ROAD }});
        room.memory.remoteRepairs = d;
    },

    setDroppedEnergy: function (room) {
        var droppedResources = room.find(FIND_DROPPED_ENERGY);
        var droppedEnergy = [];
        for(var i in droppedResources){
            var res = droppedResources[i];
            if(res.resourceType == RESOURCE_ENERGY){
                droppedEnergy.push(res);
            }
        }
        room.memory.droppedEnergy = droppedEnergy;
    },
    getDroppedEnergy:function(room){
        if(!room.memory.droppedEnergy){
            this.setDroppedEnergy(room);
        }
        return room.memory.droppedEnergy;
    },
    setDroppedResources:function (room) {
        room.memory.droppedResources = room.find(FIND_DROPPED_RESOURCES);
    },
    getDroppedResources:function(room){
        if(!room.memory.droppedResources){
            this.setDroppedResources(room);
        }
        return room.memory.droppedResources;
    },
    setLocalContainers: function (room) {
        room.memory.containers = room.find( FIND_STRUCTURES, { filter: {structureType:STRUCTURE_CONTAINER}});
    },
    getLocalContainers:function(room){
        if(!room.memory.containers){
            this.setLocalContainers(room);
        }
        return room.memory.containers;
    },

    getRoomTargetWallStrength:function(room){
        if(!room.memory.targetWallStrength){
            this.setRoomTargetWallStrength(room);
        }
        return room.memory.targetWallStrength ? room.memory.targetWallStrength : 1000;
    },
    setRoomTargetWallStrength:function(room){
        if(room.controller && room.controller.my) {
            var walls = room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_WALL}});
            var lowest = 0;
            var highest = 0;
            for(var w in walls){
                w = walls[w];
                lowest  = lowest > w.hits ? w.hits : lowest;
                highest = highest < w.hits ? w.hits : highest;
            }

            highest = highest > lowest ? highest : highest+10000;
            room.memory.targetWallStrength = highest;
        }
    },


    getRoomTargetRampartStrength:function(room){
        if(!room.memory.targetRampartStrength){
            this.setRoomTargetRampartStrength(room);
        }
        return room.memory.targetRampartStrength;
    },
    setRoomTargetRampartStrength:function(room){
        if(room.controller && room.controller.my) {
            var walls = room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_RAMPART}});
            var lowest = 0;
            var highest = 0;
            for(var w in walls){
                w = walls[w];
                lowest  = lowest > w.hits ? w.hits : lowest;
                highest = highest < w.hits ? w.hits : highest;
            }

            highest = highest > lowest ? highest : highest+10000;
            room.memory.targetRampartStrength = highest;
        }
    },


    builderQueryCache:function(room) {
        this.setConstructionSites(room);
        this.setUrgentConstruction(room);
        this.setUrgentRepairs(room);
        this.setRemoteRepairs(room);
        this.setRepairs(room);
        this.setRoomTargetRampartStrength(room);
        this.setRoomTargetWallStrength(room);
    },
    setLocalLinks: function (room) {
        room.memory.localLinks = room.find(FIND_MY_STRUCTURES, { filter: {structureType:STRUCTURE_LINK}});
    },
    getLocalLinks: function (room) {
        if(!room.memory.localLinks){
            this.setLocalLinks(room);
        }return room.memory.localLinks;
    },

    setLocalSources: function (room) {
        room.memory.sources = room.find(FIND_SOURCES);
    },
    getLocalSources: function (room) {
        return room.find(FIND_SOURCES);
        if(!room.memory.sources){
            this.setLocalSources(room);
        }return room.memory.sources;
    },
    
    setMyStructures: function (room){
        room.memory.myStructures = room.find(FIND_MY_STRUCTURES);
    },
    
    getMyStructures: function (room){
        if(!room.memory.myStructures){
            this.setMyStructures(room);
        }return room.memory.myStructures;
    },
    getHostilesInRoom:function(room){ //Improve to omit allies
        if(!room.memory.hostiles){
            this.setHostilesInRoom(room);
        }return room.memory.hostiles;
    },
    setHostilesInRoom:function(room){
        var hostiles = room.find(FIND_HOSTILE_CREEPS);
        room.memory.hostiles = hostiles;
    },
    harvesterQueryCache: function (room) {
        this.setDroppedEnergy(room);
        this.setDroppedResources(room);
        this.setLocalContainers(room);
        this.setLocalLinks(room);
        this.setLocalSources(room);
    },
    cacheRoomData:function(room){
        if(!room){
            this.log('Invalid Room Passed: '+room);
            return;
        }
        this.clearCache(room);
     //   this.setHostilesInRoom(room);
     //   this.builderQueryCache(room);
     //   this.harvesterQueryCache(room);
    },
    
    clearCache:function(room){
        room.memory.localLinks = null;
        room.memory.sources = null;
        room.memory.targetRampartStrength = null;
        room.memory.targetWallStrength = null;
        room.memory.containers = null;
        room.memory.droppedResources = null;
        room.memory.droppedEnergy = null;
        room.memory.remoteRepairs = null;
        room.memory.urgentConstruction = null;
        room.memory.urgentRepairs = null;
        room.memory.repairs = null;
        room.memory.constructionSites = null;
        room.memory.hostiles = null;
        room.memory.myStructures = null;
    }


}
module.exports = roomMemory;