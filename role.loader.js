var util = require('utility');
var roleLoader = {
    transferStuff:function(creep){
        var t = this.getTarget(creep);
        //console.log(creep.name+'Loader Debug: 1Creep full' + t);
        if(!t){
            creep.say('Secondary');
            t = this.getTarget(creep,true);
        }
        creep.say(t && t.structureType ? t.structureType : "Null Target");
        // console.log(creep.name+'Loader Debug: 2Creep full' + JSON.stringify(t));

        var res = creep.transfer(t, RESOURCE_ENERGY);

    },

    performDuty: function (creep) {
        try{
        //console.log('Loader Debug: Duty 0');
        if (creep.carry.energy < creep.carryCapacity) {
            //console.log('Loader Debug: Duty 1');
            var source = this.getSource(creep);
            if (source) {
                //console.log('Loader Debug: Duty2');
                if(source.structureType != null){
                    creep.say(source.structureType+'Struct');
                    var res = creep.withdraw(source, RESOURCE_ENERGY);
                    if(res<0){
                        if(creep.carry.energy>0){
                            this.transferStuff(creep);
                        }
                    }
                }else if(source.resourceType!=null){
                    creep.say('Drop');
                    creep.pickup(source);
                }else {
                    creep.say(source.energy);
                    //Game.notify(JSON.stringify(source));
                }
                /*
                var res = creep.withdraw(source, RESOURCE_ENERGY);
                if(res == ERR_INVALID_TARGET){
                    res = creep.pickup(source);
                }*/
                //console.log('Result of loading: ' + res);
            } else {
                //creep.say('Nothing to do');
            }
        } else {

            this.transferStuff(creep);
            // console.log(creep.name+'Transfer in progress:' +res );

        }

       // console.log('Loader Debug: Determined Source: ' + this.getSource(creep));
       // console.log('Loader Debug: Determined Target' + this.getTarget(creep));

        /*
         var target = this.getTarget(creep);
         console.log('Loader Debug: 3');
         var transferRes = creep.transfer(target,RESOURCE_ENERGY);
         console.log('Transfer Result'+transferRes);
         console.log('Loader Debug: 4');
         */
        //IDENTIFY SOURCES

        //IDENTIFY TARGETS
        }catch(err){
            Game.notify('Error in Loader perform duty: '+err);
        }

    },
    run:function(creep) {
        var mobile = creep.memory.mobile ? true : false;
        if(mobile){
            this.mobileMode(creep);
        }else{
            this.stillMode(creep);
        }
    },

    mobileMode:function(creep){
        console.log('Loader Debug: ' + dest + ' destpos:' + destPos + 'creep.pos:' + creep.pos + ' equal?' + creep.pos.isEqualTo(destPos));

        //IF AT DEST & !LOADED THEN GO FETCH

        //IF AT DEST && SOME LOAD THEN REFILL

        // IF !AT DEST && !LOAD THEN FILL
        //IF !AT DEST && LOADED THEN GO TO DEST

        var dest = creep.memory.dest;

        var destPos = new RoomPosition(dest.x,dest.y,dest.roomName);
        if(!creep.pos.isEqualTo(destPos)){ //NOT AT WORK SPOT
            if(creep.isFull()){
                creep.moveTo(destPos);
            }else{ //AT WORK SPOT
                //FInD A SOURCE
                if(creep.load() == 0){
                    this.refill(creep);
                    //COPY A MOVETOSOURCE MODE
                }else{
                    this.performDuty(creep);
                }
            }
        }else{
            if(creep.load()>0){
                this.performDuty(creep);
            }else{

            }
        }

    },

    stillMode:function(creep){
        var destinationReached = creep.memory.destinationReached;
        //console.log('Loader Debug: ' + dest + ' destpos:' + destPos + 'creep.pos:' + creep.pos + ' equal?' + creep.pos.isEqualTo(destPos));
        if (!destinationReached) {
            var dest = creep.memory.dest;
            var destPos = new RoomPosition(dest.x, dest.y, dest.roomName);
            if (creep.pos.isEqualTo(destPos)) {
                creep.memory.destinationReached = true;
                destinationReached = true;
                console.log('Loader Debug: destination reached');

            }
        }
        
        if (destinationReached) {
            //console.log('Loader Debug: Performing Duty');
            this.performDuty(creep);
        } else {
            var dist = creep.pos.getRangeTo(destPos);
            //console.log('Loader moving: ' + destPos + ' distance:' + dist);
            var r = creep.moveTo(destPos);
            //console.log('Loader moveres' + r);
        }
    },

    getTarget: function (creep,secondary) {
        try{
        var targets = this.getTargets(creep,secondary);
        //console.log('Loader: '+creep.name+'Targets: ' + JSON.stringify(targets));
        if (targets && targets.length) {
            if(secondary){
                targets =  _.sortBy( targets, target => target.store && target.store.energy);//targets.sort( (a,b) => { (a.store.energy < b.store.energy) });
                return targets[0];
            }else{
                //targets = targets.sort((a, b) => { a.energy < b.energy});
                targets = _.sortBy( targets, target => target.energy-target.energyCapacity);
                return targets[0];            
            }
          // console.log('Sorted Targets: ' + JSON.stringify(targets));
            
        } else {
            return null;
        }
        }catch(err){
            Game.notify('Error on'+creep.pos+' '+(secondary? 'secondary' : 'primary')+' running Loader GetTarget: '+err)
            return null;
        }
    },

    getTargets: function (creep,secondary) {
        try{
        var targets = creep.memory.targets;
        var sTargets = creep.memory.secondaryTargets;
        if (!targets || (targets && targets.length == 0)) {
            //console.log('Looking for targets:');
            var near = creep.pos.findInRange(FIND_STRUCTURES, 1);
            var validTargets = [];
            var validTargetsIds = [];
            var validSecondaryTargets = [];
            var validSecondaryTargetsIds = [];

            //console.log('Loader Debug: RawTargets: '+JSON.stringify(near));
            if (near) {
                for (var v in near) {
                    var o = near[v];
                    if(o){
                    if (o.structureType == STRUCTURE_TOWER || o.structureType == STRUCTURE_EXTENSION || o.structureType == STRUCTURE_SPAWN || o.structureType == STRUCTURE_LINK ) {
                        if(o.structureType.STRUCTURE_LINK && o.energy<o.energyCapacity){
                            validTargets.push(o);
                            validTargetsIds.push(o.id);
                        }else{
                            validTargets.push(o);
                            validTargetsIds.push(o.id);
                        }//console.log('Valid Target: '+JSON.stringify(o));
                    }else if((o.structureType == STRUCTURE_CONTAINER || o.structureType == STRUCTURE_STORAGE || o.structureType == STRUCTURE_TERMINAL)){
                        validSecondaryTargets.push(o);
                        validSecondaryTargetsIds.push(o.id);
                    } else {
                        //console.log('Invalid Target: '+JSON.stringify(o));
                    }
                        
                    }else{
                        //How did we get invalid objects in Near?
                        console.log('Invalid objects in targets');
                    }
                }
            } else {
                //console.log('Loader Debug no valid targets near creep');
            }
            creep.memory.targets = validTargetsIds;
            creep.memory.secondaryTargets = validSecondaryTargetsIds;
            return secondary ? validSecondaryTargets : validTargets;
        } else {

            var validTargets = [];
            for (var s in targets) {
                if(secondary){
                    var o = Game.getObjectById(sTargets[s]);
                    if (o) {
                        validTargets.push(o);
                    }
                }else{
                    var o = Game.getObjectById(targets[s]);
                    if (o) {
                        validTargets.push(o);
                    }
                }
            }
          //  console.log('Valid Targets:'+JSON.stringify(validTargets));
            return validTargets;
        }
            
        }catch(err){
            Game.notify('Error running: '+creep.pos+' Loader GetTargets: '+err);
            var arr = [];
            return arr;
        }
    },

    resetSources: function (creep) {
        creep.memory.validSources = null;
    },
    getDroppedEnergy:function(creep){
       //return creep.pos.findInRange(FIND_DROPPED_ENERGY,1);
       var droppedEnergy = roomMemory.getDroppedEnergy(creep.room);
       var close = creep.pos.findInRange(droppedEnergy,1);
       if(close){
           //creep.say(close);
           if(close && close.length){
               return close[0];
           }
           return null;
           
       }
     //  console.log('Loader dropped energy:'+creep.name+ ' '+JSON.stringify(droppedEnergy));
    //   console.log('Loader drop in range: '+creep.name+ ' '+creep.pos.findInRange(droppedEnergy,1));
        
    },

    getLink:function(creep){
        var link = creep.pos.findInRange(STRUCTURE_LINK, 1);
       // console.log('\n\n\n LInk: '+JSON.stringify(link)+'\n\n\n');
        return link;
    },

    getFarSource:function(creep){
        var validSources = this.getSources(creep,false);
        if (validSources && validSources.length) {
            validSources.sort((a, b) => {a.store[RESOURCE_ENERGY] > b.store[RESOURCE_ENERGY]});
            return validSources[0];
        } else {
            console.log('Loader Debug: No valid sources.');
            return null;
        }
    },

    getSource: function (creep) {
//        this.getDroppedEnergy(creep);
creep.say('src');
        var drop = this.getDroppedEnergy(creep);
        if(drop){
            return drop;
        }
        var link = this.getLink(creep);
            if(link  &&  link.length){
                //Check if is receiver (Else no op)
                var link = link[0];
                return link;
        }
        var validSources = this.getSources(creep,true);
        if (validSources && validSources.length) {
            validSources.sort((a, b) => {a.store[RESOURCE_ENERGY] > b.store[RESOURCE_ENERGY]});
            return validSources[0];
        } else {
            console.log('Loader Debug: No valid sources.');
           
            return null;
        }
    },
    getSources: function (creep,near) {
        if (!creep.memory.validSources) {
          //  console.log('Loader Debug: Looking for sources');
            var validSources = [];
            var validSourcesIds = [];
            var r = near ? creep.pos.findInRange(FIND_STRUCTURES,1) : creep.room.find(FIND_STRUCTURES);
            //var r = creep.pos.findInRange(FIND_STRUCTURES, 1);
            for (var s in r) {
                s = r[s];
                if (s && s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE ) {
                //    console.log(creep.memory.flagName+'Loader Debug found source: '+JSON.stringify(s));
                    validSources.push(s);
                    validSourcesIds.push(s.id);
                }
            }
            creep.memory.validSources = validSourcesIds;
            return validSources;
        } else {
            var sources = creep.memory.validSources;
          //  console.log('Loader Debug: Memorised sources: '+sources);
            var validSources = [];
            for (var s in sources) {
                var o = Game.getObjectById(sources[s]);
                if (o) {
                    validSources.push(o);
                }
            }
            return validSources;
            if (validSources && validSources.length) {
                validSources.sort((a, b) => { a.store != null && a.store[RESOURCE_ENERGY] > b.store[RESOURCE_ENERGY] });
                return validSources;
            } else {
                return null;
            }
        }
    }


};

module.exports = roleLoader;