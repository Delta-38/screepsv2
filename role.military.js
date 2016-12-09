var roleMilitary = {

    run: function (creep) {
        var v = creep.memory.subRole;
        if(v == 'defender'){
                this.runDefender(creep);
        }else if(v == 'healer'){
                this.runHealer(creep);
        }else if(v == 'dismantler'){
                this.runDismantler(creep);
        }else if(v == 'tankBait'){
                this.runTanker(creep);
        }else if(v == 'attacker'){
                this.runAttacker(creep);
        }else if(v == 'raider'){
                this.runDefender(creep);
        }else if(v == 'spam'){
                this.runSpam(creep);
        }
       // var v = creep.memory.subRole;;
       /* switch (v){
            case 'defender':{
                this.runDefender(creep);
                break;
            }
            case 'healer':{
                this.runHealer(creep);
                break;
            }
            case 'dismantler':{
                this.runDismantler(creep);
                break;
            }
            case 'tankBait':{
                break;
            }
            case 'attacker':{
                this.runAttacker(creep);
                break;
            }
        }
        */
    },//TODO write healer and selfheal routines
    //TODO Rewrite Tank Bait as a military subrole
    //TODO Write Garrison
    hasHeal:function(creep){
        return this.hasParts(creep,HEAL);
    },
    hasMelee:function(creep){
        return this.hasParts(creep,ATTACK);
    },
    hasRanged:function(creep){
        return this.hasParts(creep,RANGED_ATTACK);
    },
    hasParts:function(creep,part){
        return creep.getActiveBodyParts(part);
    },

    runTanker:function(creep){
        var flagName = creep.memory.flagName;
        var flag = Game.flags[flag];
        if(!flag){
            Game.notify('My Job is done: '+creep.name);
            creep.memory.role = recycle;
        }else{
            var maxTowerDamage = 650;
            if(this.isHurt(creep)){
                if(creep.hits<((maxTowerDamage*2)+1)){
                    this.moveToSafeZone(creep);
                }else{
                    if(this.hasHeal(creep)){
                        creep.heal(creep);
                    }
                }
            }else{

            }



        }

    },

    isHurt:function(creep){
        return creep.hits<creep.hitsMax;
    },
    
    runSpam:function(creep){
        var dest = creep.memory.dest;
        dest = new RoomPosition(dest.x, dest.y, dest.roomName);
        var flag = creep.memory.flagName;
        var path = null;
        if(flag){
            flag = Game.flags[flag];
        }else{
            creep.memory.role = 'recycle';
        }
        
        if(flag){
            path = flag.memory.path;
            
        }
        var localPath = creep.memory.path;
        if(!localPath){
            localPath = creep.pos.findPathTo(flag);
            creep.memory.path = localPath;
        }
        var res = creep.moveByPath(localPath);
        this.pdeb('Zergling: MoveByPath: '+res);
        if(res == -5){
            creep.moveTo(flag, {reusePath:20});
            creep.memory.path = null;
        }
        creep.say('Zerg\'R US!',true);
    },
    
    runAttacker: function(creep){
        var dest = creep.memory.dest;
        dest = new RoomPosition(dest.x, dest.y, dest.roomName);
        var flag = creep.memory.flagName;
        flag = Game.flags[flag];
        this.pdeb('Def CreepDefender: ' + dest + 'cPos' + creep.pos);
        if (creep.pos.roomName == dest.roomName) {
            this.pdeb('Moving to target:'+flag);
            //S&D
            this.moveTo(flag);
            var hostiles = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            var hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
            var hostileConstructionSites = creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);
            if (!hostiles && !hostileStructures && !hostileConstructionSites) {
                this.pdeb('No more hostiles');
                creep.moveTo(flag);

                //creep.memory.role = 'recycle';
            } else {
                this.pdeb('Found Hostiles' + hostiles);


                var target = 0;
                if(hostiles && hostiles.length){
                    target = creep.pos.findClosestByRange(hostiles);
                }else if(hostileStructures && hostileStructures.length){
                    target = creep.pos.findClosestByRange(hostileStructures);
                }else if(hostileConstructionSites && hostileConstructionSites.length){
                    target = creep.pos.findClosestByRange(hostileConstructionSites);
                }
                this.pdeb('Target: '+target);
                this.moveTo(target);
                var range = creep.pos.getRangeTo(target);
                if(range>1){
                    creep.say('Def CreepGoing to brawl !');
                    var res = creep.moveTo(target);
                    this.pdeb('Def CreepI am too far: moving closer' + res);
                }
                if(this.hasRanged(creep) && range<=3){
                    var att = creep.rangedAttack(target);
                    this.pdeb('Def CreepAttacking rangeAttack res: ' + att);
                }
                if (range==1) {
                    creep.say('Die Potato! Die!');
                    var att = creep.attack(target);
                    this.pdeb('Def CreepAttacking att res: ' + att);
                }
                if(this.hasHeal(creep)){
                    if(creep.hits<creep.hitsMax){
                        creep.heal(creep);
                    }
                    var creepsInRange = creep.pos.findInRange(FIND_MY_CREEPS,3);
                    if(creepsInRange && creepsInRange.length){
                        creepsInRange.sort( (a,b) => { (a.hitsMax-a.hits) > (b.hitsMax-b.hits)});
                        creep.rangedHeal(creepsInRange[0]);
                    }
                }
            }

        } else {
            var res = creep.moveTo(dest);
            creep.say('OMW');
            this.pdeb('Def Creep Moving to target: ' + res);
        }

    },

    runDismantler:function(creep){
        var dest = creep.memory.dest;
        if(!dest){
            dest = creep.pos;
        }
        var targets = creep.memory.targets;
        var flagName = creep.memory.flagName;
        var flag = Game.flags[flagName];
        if(flag) {
            dest = flag.pos;


            if (!creep.pos.isNearTo(dest)) {
                var mov = creep.moveTo(dest);
            } else {
                var targets = dest.findInRange(FIND_STRUCTURES, 0);
                if (targets && targets.length) {
                    creep.log(creep.dismantle(targets[0]));
                    creep.say('16Tons',true);
                } else {
                    var structures = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                    if (structures && structures.length) {
                        creep.log(creep.dismantle(structures[0]));
                    }
                }
            }
        }else{
            if(creep.room.controller && !creep.room.controller.my){
                var r = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                creep.moveTo(r);
                creep.dismantle(r);
                creep.say('16Tons',true);
            }else{
                creep.say('No Work');
            }

        }
        if(targets){
            var closest = creep.pos.findClosestByRange(targets);
        }
        var currentTarget = closest;
        creep.memory.currentTarget = currentTarget;

    },

    runHealer:function(creep){
        var dest = creep.memory.dest;
        
        
        var flag = Game.flags[creep.memory.flagName];
        dest = flag.pos;
        creep.log('Healer Creep: \n\n\n');
        var hurtFriendlies = creep.room.find(FIND_MY_CREEPS, {filter: (creep) => {return creep.hitsMax > creep.hits }});

        if(hurtFriendlies){
            var hurt = creep.pos.findClosestByRange(hurtFriendlies);
            creep.moveTo(hurt);
            var rangeTo = creep.pos.getRangeTo(hurt);
            if(rangeTo==1){
                creep.heal(hurt);
            }else if(rangeTo<=3){
                creep.rangedHeal(hurt);
            }
        }else{
            creep.moveTo(dest);
        }
    },
    isAtStagingArea:function(creep,dest){
        if(creep.pos.inRangeTo(dest,4)){
            return true;
        }return false;
    },

    attackBuildings:function(creep){
        var hostilesBuildings = creep.room.find(FIND_HOSTILE_STRUCTURES);
        if(hostilesBuildings && hostilesBuildings .length){
            var turrets = creep.room.find(hostilesBuildings, { filter: (s) => { return s.structureType == STRUCTURE_TOWER }});
            if(turrets  && turrets.length){
                var near = creep.pos.findClosestByRange(turrets);
                var getRange = creep.pos.getRangeTo(near);
                creep.moveTo(near,{ ignoreDestructibleStructures : true});
                if(this.isRangedCreep(creep) && getRange<=3){
                    creep.rangeAttack(near);
                }
                if(this.isMeleeCreep(creep) && getRange<=1){
                    creep.attack(near);
                }
            }else{

            }
        }else{
            creep.log('AttackBuildings: invalid list passed'+buildings);
        }


    },

    runDefender:function(creep){
        try{
        var usedAttack = false;
        var flag = creep.memory.flagName;
        flag = Game.flags[flag];
        var dest = flag.pos;//creep.memory.dest;
        dest = new RoomPosition(dest.x,dest.y,dest.roomName);
        
        var peaceCountdown = creep.memory.peaceCountdown;
        if(!peaceCountdown){
            creep.memory.peaceCountdown = 0;
            peaceCountdown = 0;
        }
        this.pdeb('Def CreepDefender: '+dest+'cPos'+creep.pos+ 'peaceCountdown:'+peaceCountdown);
        if(creep.pos.roomName == dest.roomName){
            this.pdeb('Moving to target:\n\n\n\n');
            //S&D

            var hostiles = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            creep.say('H:'+hostiles);
            if(!hostiles){
                creep.say('Clear!');
                creep.moveTo(dest);
                if(creep.room.owner!= creep.owner){
                    creep.say('DiddleDoo');
                }else{

                this.pdeb('No more hostile creeps');
                creep.say('AllGood');
                if(peaceCountdown<100){
                    creep.memory.peaceCountdown = peaceCountdown+1;
                }else{
                    //creep.memory.role = 'recycle';

                }
                }
               
            }else{
                //creep.say('H?');
                creep.memory.peaceCountdown = 0;
                this.pdeb('Found Hostiles'+hostiles);
                if(creep.pos.isNearTo(hostiles)){
                    creep.say('Def Creep Die Potato! Die!');
                    var att = creep.attack(hostiles);
                    creep.rangedAttack(hostiles);
                    usedAttack = true;
                    this.pdeb('Def CreepAttacking att res: '+att);
                }else{
                    /*
                     if(this.hasRanged(creep) && creep.pos.getRangeTo(hostiles)){
                     creep.rangedAttack(hostiles);
                     }
                     */

                   // creep.say('Def CreepGoing to brawl !');
                    var res = creep.moveTo(hostiles);
                    if(res<0){
                       // creep.say('Merr:'+err);
                    }
                    this.pdeb('Def CreepI am too far: moving closer'+res);
                    creep.rangedAttack(hostiles);
                    if(!usedAttack && creep.hits<creep.hitsMax){
                        creep.heal(creep);
                    }
                }
            }

        }else{
            var res = creep.moveTo(dest, {reusePath: 50});
            creep.say('OMW');
            this.pdeb('Def Creep Moving to target: '+res);
            if(res<0){
                creep.moveTo(dest);
            }
        }
        if(creep.hits<creep.hitsMax){
            creep.heal(creep);
        }
        }catch(err){
            Game.notify('Error running military defender:'+creep.pos+' '+JSON.stringify(creep.memory)+' Error: '+err);
        }
    },
    pdeb: function (text) {
        creep.log(text);
    }


};

module.exports = roleMilitary;