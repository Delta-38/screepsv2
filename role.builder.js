/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */
var utility = require('utility');
module.exports = {

    builder:function(creep,sites){
        //console.log('Builder: '+creep.name+ ' sites: '+JSON.stringify(sites));
        var t = creep.pos.findClosestByPath(sites);
        var err = 0;
        if((err =creep.build(t))==ERR_NOT_IN_RANGE){
            creep.moveTo(t, {reusePath:10 , maxRooms:0});
            creep.say('Going '+t);
        }else{
            console.log('Builder: '+creep.name+ ' building error: '+err+'\n\n');

        }
    },
    repairer:function(creep,repairs){
        var t = repairs[0];
        //console.log('Builder: '+creep.name+ ' repairs: '+JSON.stringify(repairs));

        if(creep.repair(t)==ERR_NOT_IN_RANGE){
            creep.moveTo(t,{reusePath:10 , maxRooms:0});
            creep.say('Go: '+t.pos.x+'-'+t.pos.y);
        }
    },

    remoteRepairsByPriority:function(structures){
        var resultArray = [];
         structures = _.sortBy(structures, structure => (100-((structure.hitsMax - structure.hits)*100)/(structure.hitsMax)));
        if(Game.time%5==0){
            //Game.notify("R:"+structures[0]+"TestSorRes:"+JSON.stringify(structures));
            //Game.notify("TestSorRes: Room"+this.listHealth(structures));
        }
        return structures;
    },
    listHealth: function(structures){
        var res = "HealthBy%HealthLeft\n";
        for(var i = 0; i<structures.length;i++){
            var s = structures[i];
            res += "St:"+s.structureType + " pos:"+s.pos.x+"-"+s.pos.y+ " MH:"+s.hitsMax+" H:"+s.hits+" %"+ (100-((s.hitsMax - s.hits)*100)/(s.hitsMax));
        }
        return res;
    },
    
    runRemote: function(creep){ //TODO FIX ENERGY LESS ROOM FIXER
        try{
            //FIND FLAGS FOR CONSTRUCTION
            var targetWallStrength = 200000;
            var targetRampartStrength = 300000;
            var flagName = creep.memory.flagName;
            var flag = Game.flags[flagName];
            this.basicSetting(creep);
            //var constructionSites = roomMemory.getConstructionSites(flag.room);
            //console.log('Creep: '+creep.name+ ' RemoteRoom: '+flag.room+' Sites:'+JSON.stringify(constructionSites));
            var hostiles = roomMemory.getHostilesInRoom(creep.room);
            if(creep.shouldFlee(hostiles)){
                creep.flee(hostiles);
                creep.say('Oh!Noes!',true);
                return;
            }
            
            var destReached = creep.memory.destReached;
            if(!destReached){
                if(creep.pos.isNearTo(flag)){
                    creep.memory.destReached = true;
                }else{
                    creep.moveTo(flag);
                    creep.say('Going '+flag);
                    return;
                }
            }
            /*
             if(!destReached){
             console.log('Builder: '+creep.name+' moving to:'+flag);
             creep.moveTo(flag.pos);
             }

             */
            if(creep.memory.building){
                //Get construction sites
                console.log('Builder: '+creep.name+ ' Looking for tasks');
                if(flag && 1==2){
                    if(creep.pos.roomName != flag.pos.roomName){
                        creep.memory.destReached = false;
                    }
                }



                /*
                var rampartRepairs = creep.room.find(FIND_STRUCTURES, {filter: (structure) => { return (structure.structureType == STRUCTURE_RAMPART && structure.hits < 10000) || ( structure.structureType == STRUCTURE_WALL && structure.hits < targetWallStrength )}});
                if(rampartRepairs && rampartRepairs.length){
                    rampartRepairs = _.sortBy(rampartRepairs, s => s.hits);
                    this.repairer(creep,rampartRepairs);
                    return;
                }
                */
                creep.say('duh!');
                var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                if(sites && sites.length){
                    creep.say('building)');
                    this.builder(creep,sites);
                    return;
                }
                
                //Sort structures by health
                var repairs = creep.room.find(FIND_STRUCTURES, {filter: (structure) => { return structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_WALL && structure.hits < structure.hitsMax }});
               
                if(repairs && repairs.length){
                    //repairs = _.sortBy(repairs, s => s.hits);
                    repairs =  this.remoteRepairsByPriority(repairs);
                    this.repairer(creep,repairs);
                    return;
                }

     
            }else{
                //creep.say('Fetch Stuff');
                creep.say('Fetch');
                if(!creep.room.controller){
                    var remoteSourceRoom = creep.memory.remoteSourceRoom;
                    if(remoteSourceRoom ){
                        creep.moveTo(20,20,remoteSourceRoom);
                    }else{
                        creep.memory.remoteSourceRoom = null;
                    }


                    return;   
                }
                
                var droppedEnergy = roomMemory.getDroppedEnergy(creep.room);//creep.room.find(FIND_DROPPED_ENERGY);// = utility.getNearestDroppedEnergy(creep);
                var containers;// = creep.room.find( FIND_STRUCTURES, {filter: (container) => { return container.structureType == STRUCTURE_CONTAINER && container.store[RESOURCE_ENERGY]>0}});
                var roomStorage = null;
                var dest = null;
                var nearestEnergy = droppedEnergy;
                creep.memory.loading = true;
                //console.log('RunRemote: '+JSON.stringify(droppedEnergy));
                //droppedEnergy = null;
                if( droppedEnergy && droppedEnergy.length && droppedEnergy[0] && droppedEnergy[0].amount>20){///{//(droppedEnergy = utility.getNearestDroppedEnergy(creep)) && droppedEnergy>50){
                    creep.say('Pickup');
                    dest = creep.pos.findClosestByRange(droppedEnergy);
                    if(dest!=null){
                        //console.log('COnt: '+dest+ ' en: '+dest.energy);
                        if(creep.pickup(dest)==ERR_NOT_IN_RANGE){
                            creep.say('B-Pickup');
                            creep.moveTo(dest,{reusePath:10 , maxRooms:0});
                        }

                    }
                }else if(nearestEnergy.length){
                    creep.say('NPickup');
                   // console.log('NearestEnergy'+nearestEnergy);
                    if(creep.pos.isNearTo(nearestEnergy)){
                        creep.withdraw(nearestEnergy, RESOURCE_ENERGY);
                    }else{
                        creep.moveTo(nearestEnergy,{reusePath:10 , maxRooms:0});
                    }
                }else if((containers = creep.room.find(FIND_STRUCTURES, {filter: (container) => {return (container.structureType == STRUCTURE_CONTAINER || container.structureType == STRUCTURE_STORAGE) && container.store[RESOURCE_ENERGY] > 0}})) && containers.length>0){
                    containers.sort((a,b) => (a.store[RESOURCE_ENERGY] > b.store[RESOURCE_ENERGY]));
                    dest = containers[0];//creep.pos.findClosestByPath(containers);
                    if(dest!=null){
                        //console.log('COnt: '+dest+ ' en: '+dest.energy);
                        creep.say('COnt');
                        if(creep.withdraw(dest, RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                            creep.say('B-Pickup');
                            creep.moveTo(dest);
                        }

                    }else{
                        creep.say('No C');
                    }
                }else if((roomStorage = creep.room.find( FIND_STRUCTURES,
                        {filter: (container) => {
                            return container.structureType == STRUCTURE_STORAGE && container.store[RESOURCE_ENERGY]>0}}) && roomStorage && roomStorage.length)){
                    dest = roomStorage[0];//creep.pos.findClosestByPath(containers);
                    if(dest!=null){
                        //console.log('COnt: '+dest+ ' en: '+dest.energy);
                        if(creep.withdraw(dest, RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                            creep.say('B-Pickup');
                            creep.moveTo(dest,{reusePath:10 , maxRooms:0});
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
                            moveRes = creep.moveTo(dest,{reusePath:10 , maxRooms:0});

                        }else{
                            creep.say('H->E');
                            creep.memory.loading = true;
                        }

                    }else{
                        creep.say('No E');
                    }
                }

            }
        }catch(err){
            var error = '\nError in RemoteBuilder: '+creep.name+' in room: '+creep.pos.roomName+'Err:'+err+'\n';
            Game.notify(error,10);
        }
    },

    basicSetting:function(creep){
        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
        }
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
        }
    },
    run: function (creep) {


        /*
         if(creep.carry.energy < creep.carryCapacity) {
         creep.say('fetching');
         var sources = �creep.room.find(FIND_SOURCES);
         if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
         creep.moveTo(sources[0]);
         }
         }else{
         creep.say('upgrading');
         if(creep.transfer(Room.controller) == ERR_NOT_IN_RANGE){
         creep.moveTo(Room.controller);
         }
         }*/
        //TODO Needs to use Room Based search after first target eval. (
        //TODO Needs to support destination room on a flag.
        // console.log('Builder:'+creep.name+' Room:'+creep.room+' TargetWall'+roomMemory.getRoomTargetWallStrength(creep.room)+' TargetRampart: '+roomMemory.getRoomTargetRampartStrength(creep.room));

        this.basicSetting(creep);
        var moveRes = 0;
        if (creep.memory.building) {

            var roomName = creep.memory.roomName;
            var p = creep.pos;
            if(roomName && creep.pos.roomName != roomName || (p.x >= 49 || p.y >= 49 || p.x == 0 || p.y == 0 )){
                creep.moveTo(new RoomPosition('20','20',roomName));
                creep.say('BToRoom');
                return;
            }
            if(!roomName){
                Game.notify('Room Less builder'+creep.name+creep.pos);
            }

            //creep.say('Building');
            var lastBTarget = creep.memory.lastBTarget != null ? Game.getObjectById(creep.memory.lastBTarget) : null;

            var targetWallStrength = 250000;
            var targetRampartStrength = 300000;
            var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
//
            targetWallStrength = roomMemory.getRoomTargetWallStrength(creep.room);
            targetRampartStrength = roomMemory.getRoomTargetRampartStrength(creep.room);
            var nextNearlyDone = creep.room.find(FIND_STRUCTURES, {filter: (structure) => {return structure.progress}  });
            var allRepairs = creep.room.find(FIND_STRUCTURES, {filter: (structure) =>
                    {return ((structure.structureType != STRUCTURE_WALL || structure.structureType != STRUCTURE_RAMPART) && structure.hits < structure.hitsMax) ||

                ((structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART ) && structure.hits < targetWallStrength)
        }
        });
            var urgentRepairs = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                    return (((structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) && (structure.hits) < (structure.hitsMax - (structure.hitsMax / 10) * 2)) ||
                ((structure.structureType == STRUCTURE_WALL ) && structure.hits < targetWallStrength) || ( structure.structureType == STRUCTURE_RAMPART && structure.hits < targetRampartStrength));
        }
        });
            allRepairs.sort((a, b) => a.hits < b.hits);

            var rampartRepairs = creep.room.find(FIND_STRUCTURES, {filter: (structure) => {return structure.structureType == STRUCTURE_RAMPART && structure.hits <= targetRampartStrength}
        });
            // console.log(targets);
            //if(target) {

            if (target) {

                console.log(creep.name + ': Building' + target.pos);
                if (creep.memory.target != null) {
                    var t = Game.getObjectById(creep.memory.target);
                    if (t != null && t.progress != t.progressTotal) {
                        target = Game.getObjectById(creep.memory.target);
                        creep.say('B->' + target.structureType);
                        console.log('B->' + target.structureType + ' ' + target.pos);
                    } else {
                        creep.memory.target = null;
                    }
                } else {
                    creep.memory.target = null;

                    var urgentConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
                            filter: (structure) => {
                            return (structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER ||
                        structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_CONTAINER);
                }
                })
                    urgentConstructionSites.sort((a, b) => (a.progressTotal / a.progress) > (b.progressTotal / b.progress));
                    if (urgentConstructionSites.length > 0) {
                        target = urgentConstructionSites[0];
                    } else {
                        var normalConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
                                filter: (structure) => {
                                return (structure.structureType == STRUCTURE_ROAD || structure.structureType == STRUCTURE_WALL);
                    }
                    });
                        if (normalConstructionSites.length > 0) {
                            normalConstructionSites.sort((a, b) => (a.progressTotal < b.progressTotal) && ((a.progressTotal / a.progress) > (b.progressTotal / b.progress)));
                            target = normalConstructionSites[0];
                        }
                    }

                }
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    moveRes = creep.moveTo(target,{reusePath:10 , maxRooms:0});
                } else {
                    creep.memory.target = target.id;
                }
            } else if (urgentRepairs.length > 0) {
                creep.say('U-Fix');

                //var dest = _.sortBy(urgentRepairs, rep , rep.hits)[0];
                // urgentRepairs = urgentRepairs.sort( (a,b) => a.hits < b.hits);
                //urgentRepairs = _.sortBy(urgentRepairs, function(r) { return r.hits});
                var lowest = this.lowestHits(urgentRepairs);
                //console.log('Get Lowest Repair'+JSON.stringify(lowest));
                var dest = lowest ? lowest :urgentRepairs[0];
                //var dest = urgentRepairs[0]; // creep.pos.findClosestByRange(urgentRepairs);
                //console.log('Urgent Repairs: '+JSON.stringify(urgentRepairs));
                creep.say('U-fix'+dest.hits ? dest.hits : '');
                if (creep.repair(dest) == ERR_NOT_IN_RANGE) {
                    //moveRes = creep.moveTo(urgentRepairs[0]);
                    moveRes = creep.moveTo(dest,{reusePath:10 , maxRooms:0});

                }
            } else if (rampartRepairs != null && rampartRepairs.length > 0) {
                _.sortBy(rampartRepairs, rampart,rampart.hits);
                rampartRepairs.sort((b1, b2) => {b1.hits < b2.hits });
                creep.repair(rampartRepairs[0]);
            } else if (allRepairs.length > 0) {
                // _.sortBy(allRepairs,rep,rep.hits);
                allRepairs.sort((b1, b2) => {b1.hits < b2.hits });
                creep.say('N-Fix');
                if (creep.repair(allRepairs[0]) == ERR_NOT_IN_RANGE) {
                    moveRes = creep.moveTo(allRepairs[0],{reusePath:10 , maxRooms:0});
                }
            } else {
                //creep.moveTo(Game.flags.ParkingLot);
                this.moveToParking(creep);
            }
        }
        else {
            //creep.say('Fetch Stuff');
            var droppedEnergy = creep.pos.findClosestByPath(roomMemory.getDroppedEnergy(creep.room)); //creep.pos.findInRange(FIND_DROPPED_RESOURCES,1);//roomMemory.getDroppedEnergy(creep.room);// = utility.getNearestDroppedEnergy(creep);
            var containers;// = creep.room.find( FIND_STRUCTURES, {filter: (container) => { return container.structureType == STRUCTURE_CONTAINER && container.store[RESOURCE_ENERGY]>0}});
            var roomStorage = null;
            var dest = null;
            var nearestEnergy = utility.getNearestEnergy(creep);
            creep.memory.loading = true;
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
                   //console.log('Upgrader LINKME'+err+' '+JSON.stringify(closestLink));
                }/*
                if(creep.withdraw(closestEnergy,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                   creep.moveTo(dest); 
                }*/
            }else if(droppedEnergy){
                 dest = droppedEnergy;
                if (dest != null) {
                    //console.log('COnt: '+dest+ ' en: '+dest.energy);
                    if (creep.pickup(dest) == ERR_NOT_IN_RANGE) {
                        creep.say('B-Pickup');
                        creep.moveTo(dest,{reusePath:10 , maxRooms:0});
                        return;
                    }

                }
                
            }else if((droppedEnergy = utility.getNearestDroppedEnergy(creep)) && droppedEnergy > 50) {
                dest = droppedEnergy;
                if (dest != null) {
                    //console.log('COnt: '+dest+ ' en: '+dest.energy);
                    if (creep.pickup(dest) == ERR_NOT_IN_RANGE) {
                        creep.say('B-Pickup');
                        creep.moveTo(dest,{reusePath:10 , maxRooms:0});
                    }

                }
            } else if (nearestEnergy) {
                console.log('NearestEnergy' + nearestEnergy);
                if (creep.pos.isNearTo(nearestEnergy)) {
                    creep.withdraw(nearestEnergy, RESOURCE_ENERGY);
                } else {
                    creep.moveTo(nearestEnergy,{reusePath:10 , maxRooms:0});
                }
            } else if ((containers = utility.getLocalContainers(creep, false)) && containers != null && containers.length > 0) {
                containers.sort((a, b) => (a.store[RESOURCE_ENERGY] > b.store[RESOURCE_ENERGY]));
                dest = containers[0];//creep.pos.findClosestByPath(containers);
                if (dest != null) {
                    //console.log('COnt: '+dest+ ' en: '+dest.energy);
                    if (creep.withdraw(dest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.say('B-Pickup');
                        creep.moveTo(dest,{reusePath:10 , maxRooms:0});
                    }

                } else {
                    creep.say('No C');
                }
            }
            else if ((roomStorage = creep.room.find(FIND_STRUCTURES, {filter: (container) => {return container.structureType == STRUCTURE_STORAGE && container.store[RESOURCE_ENERGY] > 0}})
        && roomStorage && roomStorage.length ))
            {
                dest = roomStorage[0];//creep.pos.findClosestByPath(containers);
                if (dest != null) {
                    //console.log('COnt: '+dest+ ' en: '+dest.energy);
                    if (creep.withdraw(dest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.say('B-Pickup');
                        creep.moveTo(dest,{reusePath:10 , maxRooms:0});
                    }

                } else {
                    creep.say('No C');
                }

            }
        else
            {
                var sources = creep.room.find(FIND_SOURCES);
                dest = creep.pos.findClosestByRange(sources);
                if (dest != null) {
                    //console.log('COnt: '+dest+ ' en: '+dest.energy);
                    if (creep.harvest(dest) == ERR_NOT_IN_RANGE) {
                        moveRes = creep.moveTo(dest,{reusePath:10 , maxRooms:0});

                    } else {
                        creep.say('H->E');
                        creep.memory.loading = true;
                    }

                } else {
                    creep.say('No E');
                }
            }
        }
        switch (moveRes) {
            case(0): {
                //Do nothing
                break;
            }
            case(-4): {
                creep.say('I\'m being Born!');
            }
            case(-11): {
                creep.say('I\'m tired');
            }
            case(-2): {
                //creep.moveTo(Game.flags.ParkingLot);
                this.moveToParking(creep);
            }
            default:
                //creep.say('MvErr:'+moveRes);
                console.log('Sono: ' + creep.name + ' bloccato ');//verso: '+creep.moveTo(Game.flags.ParkingLot));
                break;
        }
        /*
         else if(Game.spawns.TheSpawn.energy < Game.spawns.TheSpawn.energyCapacity) {
         if(creep.transfer(Game.spawns.TheSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
         creep.moveTo(Game.spawns.TheSpawn);
         }
         }else{
         creep.moveTo(Game.flags.ParkingLot);
         this.moveToParking(creep);

         }
         */
    },

    lowestHits:function(stuff){
        var low = null;
        var result = null;
        for(var ob in stuff){
            var o = stuff[ob];
            //console.log('PLowest:'+JSON.stringify(o));
            if(low){

                //console.log('PLowest: LV:'+low+' hits'+o.hits);
                if(low>o.hits){
                   //console.log('PLowest: LV:'+low+' ob: '+o.structureType+'hits'+o.hits);
               
                    low = o.hits;
                    result = o;
                }
            }else{
                //console.log('PLowest: LV undefined:'+low+' ob: '+o.structureType+'hits'+o.hits);
                low = o.hits;
                result = o;
            }

        }
        return result;
    },

    moveToParking:function(creep){
        var v = creep.pos.findClosestByRange(FIND_FLAGS, { filter:(f) => {f.color = COLOR_GREEN }});
        if(v && v.length){
            creep.moveTo(v);
        }
    }
};