/**
 * Created by paolo on 31/08/2016.
 */


var roleBuilder = {


    run:function(creep){
        //Concept working room
        //Can leave room for energy but must come back
        try {
            this.basicSetting(creep);
            var hostiles = roomMemory.getHostilesInRoom(creep.room);
            if(hostiles && creep.shouldFlee(hostiles)){
                creep.say('OMG!');
                creep.flee(hostiles);
            }else {
                switch (creep.getRole()) {
                    case 'remoteBuilder':
                        this.remoteBuilder(creep);
                        break;
                    case 'builder':
                        this.regularBuilder(creep);
                        break;
                    default:
                        this.regularBuilder(creep);
                        break;
                }
            }
        }catch(err){
            var error = 'Error running builder3: '+creep.name+' Mem'+JSON.stringify(creep.memory) + ' Error: '+err;
            console.log(error);
            //Game.notify(error,10);
        }
    },


    remoteBuilder: function( creep){



        if(this.isBuilding(creep)){
            if(this.isInWorkingRoom(creep)){
                var lowWalls = this.getLowWallsAndRamparts(creep);
                var sites = null;
                var repairs = null;
                if(lowWalls && lowWalls.length){
                    var target = creep.pos.findClosestByRange(lowWalls);
                    this.fixThis(creep,target);
                }else if((sites = roomMemory.getConstructionSites(creep.room)) && sites && sites.length){
                    //Prioritize
                    var target = creep.pos.findClosestByRange(sites);
                    this.buildThis(creep,target);
                }else if((repairs = roomMemory.getUrgentRepairs(creep.room) && repairs && repairs.length)){
                    var target = creep.pos.findClosestByRange(repairs);
                    this.fixThis(creep,target);
                }else{
                    //DO Something else
                    //Consider upgrading stuff

                }

            }else{
                this.goToWorkingRoom(creep);
            }

        }else{
            this.refill(creep);
        }
    },

    fixThis: function (creep, target) {
        console.log(creep.name+' regular fix this:'+target);

        creep.moveTo(target);
        var r = creep.repair(target);
        console.log(creep.name+' regular fix this:'+target+'r'+r);
        if(r == OK){
            this.setLastBTarget(creep,target,true);
        }

    },

    buildThis: function(creep,target){
        console.log(creep.name+' regular build this:'+target);

        creep.moveTo(target);
        var r = creep.build(target);
        if(r == OK){
            this.setLastBTarget(creep,target,false);
        }
    },

    regularBuilder: function (creep) {
        console.log('BUILDER'+creep.name+' regular builderstart');
        if(this.isBuilding(creep)){

            //  console.log('BUILD: Repairs C: '+JSON.stringify(c));
            //  console.log('BUILD: UrgentRepairs: '+JSON.stringify(roomMemory.getUrgentRepairs(creep.room)));

            // console.log('BUILD: tRepairs: '+JSON.stringify(roomMemory.getRepairs(creep.room)));
            //console.log(creep.name+' building');
            if(this.isInWorkingRoom(creep)){
                var lastBTarget = this.getLastBTarget(creep);
                console.log(creep.name+' regular build this:'+lastBTarget);

                if(lastBTarget){
                    var isRepair = this.lastBTargetIsRepair(creep);
                    if(!isRepair){
                        if(lastBTarget.progress< lastBTarget.progressTotal){
                            this.buildThis(creep,lastBTarget);
                        }else{
                            this.clearBTarget(creep);
                        }
                    }else{
                        if(lastBTarget.hits<lastBTarget.hitsMax){
                            this.fixThis(creep,lastBTarget);
                        }else{
                            this.clearBTarget(creep);
                        }
                    }
                }else {

                    // console.log(creep.name+'looking for tasks');
                    var lowWalls = this.getLowWallsAndRamparts(creep);

                    // console.log(creep.name+'looking for tasks walls'+lowWalls);

                    var sites = roomMemory.getConstructionSites(creep.room);
                    var repairs = roomMemory.getUrgentRepairs(creep.room);
                    if (lowWalls && lowWalls.length) {
                        //       console.log(creep.name+' found low walls');
                        var target = creep.pos.findClosestByRange(lowWalls);
                        this.fixThis(creep, target);
                    } else if (sites && sites.length) {
                        //      console.log(creep.name+' found buildings');
                        //Prioritize
                        var target = creep.pos.findClosestByRange(sites);
                        this.buildThis(creep, target);
                    } else if ((repairs && repairs.length)) {
                        repairs = _.sortBy(repairs, function (rep) {
                            return rep.hits
                        });
                        //    console.log(creep.name+' found urgent repairs'+JSON.stringify(repairs));
                        //
                        var target = repairs[0];
                        this.fixThis(creep, target);
                    } else {

                        //   console.log(creep.name+' nothing to do' );
                        //DO Something else
                        //Consider upgrading stuff
                        creep.say('Bored!');
                    }

                }
            }else{
                this.goToWorkingRoom(creep);
                console.log(creep.name+' going to room');
            }
        }else{
            console.log(creep.name+'Refilling');
            this.refill(creep);
        }
        console.log(creep.name+' regularbuilderend');
    },

    getLowWallsAndRamparts:function (creep){
        var lowWall = 10000;
        var lowWalls = creep.room.find(FIND_STRUCTURES, { filter: (s) => { return ( s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < lowWall }});
        return lowWalls;
    },


    fetchFromStores:function(creep, dest){
        var mres = creep.moveTo(dest);
        var r = creep.pos.getRangeTo(dest);
        if(r<2){
            var res = creep.withdraw(dest,RESOURCE_ENERGY);
        }
    },
    pickupFromDest:function(creep, dest){
        var mres = creep.moveTo(dest);
        var r = creep.pos.getRangeTo(dest);
        if(r<2){
            var res = creep.pickup(dest);
        }
    },

    isInWorkingRoom:function(creep){
        var workingRoom = creep.memory.workingRoom;
        if(workingRoom){
            if(creep.pos.roomName == workingRoom){
                return true;
            }else{
                return false;
            }
        }else{
            creep.memory.workingRoom = creep.pos.roomName;
            return true;
        }
    },

    goToWorkingRoom:function(creep){
        var roomPos = new RoomPosition(20,20,creep.memory.workingRoom);
        creep.ecoMove(roomPos);
    },









    refill:function(creep){
        var a = 0;
        if((a = creep.energyNear())){
            creep.pickup(a);
            return;
        }

        var localContainers = roomMemory.getLocalContainers(creep.room);
        var nonEmpty = [];
        for(var v in localContainers){
            v = localContainers[v];
            if(v.store && v.store[RESOURCE_ENERGY] && v.store[RESOURCE_ENERGY]>=(creep.carryCapacity/2)){
                nonEmpty.push(v);
            }
        }
        var container; // = creep.pos.findClosestByPath(nonEmpty);
        if(nonEmpty && nonEmpty.length && (container = creep.pos.findClosestByPath(nonEmpty))){
            this.fetchFromStores(creep,container);
        }else{
            var e = 0;
            if(creep.room.storage && (e = creep.room.storage.store[RESOURCE_ENERGY]) && e>0){
                this.fetchFromStores(creep, creep.room.storage);
            }else{
                var e = roomMemory.getDroppedEnergy(creep.room);
                var validEnergy = [];
                if(e && e.length){
                    for(var v in e){
                        v = e[v];
                        if(v && v.resourceType[RESOURCE_ENERGY] && v.amount>0){
                            validEnergy.push(v);
                        }
                    }
                    if(validEnergy  && validEnergy.length){
                        var near = creep.pos.findClosestByRange(validEnergy);
                        if(near){
                            this.pickupFromDest(near);
                        }
                    }
                }
            }


        }
    },

    isBuilding:function(creep){
        return creep.memory.building == true;
    },
    isLoading:function(creep){
        return creep.memory.loading == true;
    },
    basicSetting:function(creep){
        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            this.clearBTarget(creep);
        }
        if (!creep.memory.building && creep.isFull()) {
            creep.memory.building = true;
        }
    },

    setLastBTarget:function(creep,target,isRepair){
        creep.memory.lastBTarget = target.id;
        creep.memory.lastBTargetIsRepair = isRepair;
    },
    getLastBTarget:function(creep){
        var bTarget = creep.memory.lastBTarget;
        if(bTarget){
            return Game.getObjectById(bTarget);
        }return null;
    },
    lastBTargetIsRepair:function(creep){
        return creep.memory.lastBTargetIsRepair;
    },
    clearBTarget:function(creep){
        creep.memory.lastBTarget = null;
        creep.memory.lastBTargetIsRepair = null;
    }









}
module.exports = roleBuilder;