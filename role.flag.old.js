/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.flag');
 * mod.thing == 'a thing'; // true
 */
var util = require('utility');
var _ = require('lodash');
var roleFlag = {
    //TODO Maybe move room complex flag tasks to separate files
    roomDangerCheck:function(flag){
        var hostileCountdown = flag.memory.HostileCountdown;
        if(flag.room){
            var hostiles = util.findHostileCreeps(flag.room);
            //console.log('Hostiles: '+hostiles);
            if(hostiles && hostiles.length){
                var boogie = hostiles[0];
                flag.memory.HostileCountdown = boogie.ticksToLive ? boogie.ticksToLive : 1500;
                var boogieIds = new Array();
                for(var v in hostiles){
                    boogieIds.push(v.id);
                }
                flag.memory.boogies = boogieIds;
                if(boogie.ticksToLive%100 == 0){
                    Game.notify('Enemy Creeps in room:'+flag.pos.roomName+' Owner: '+boogie.owner.username+' Will not call new creeps EnemyLifetime:'+boogie.ticksToLive,10);
                }
                return true;
            }else{
                flag.memory.HostileCountdown = 0;
                return false;
            }
        }else if(hostileCountdown){
            if(hostileCountdown>0){
                if(hostileCountdown % 100 == 0){
                    Game.notify('Flag: '+flag.name+ 'Operations suspended due to enemy presence until: '+hostileCountdown,1);
                }
                flag.memory.HostileCountdown = hostileCountdown-1;
                return true;
            }else{
                flag.memory.HostileCountdown = 0;
                return false;
            }
        }
        return false;
    },



    agingCreeps:function(creepGroup){

        for(var c in creepGroup){
            c = creepGroup[c];
            if(c.ticksToLive<100){
                return true;
            }
        }return false;
    },

    pathingFlag:function(flag){
        if(!flag.room){
            return;
        }
        
        var dest = flag.memory.dest ? Game.getObjectById(flag.memory.dest) : null;
        if(!dest) {
            this.pdeb("Flag: "+flag.name+" no destination set");
            return;
        }
        var res = null;
        var path = flag.memory.path;
        if(!path || flag.memory.recalc){
            res = PathFinder.search(flag.pos,dest,{plainCost:2, swampCost:4});
            flag.memory.path = res;
            flag.memory.recalc = false;
        }
      
        var buildRoad = flag.memory.buildRoad;
        if(buildRoad){
            this.buildRoads(path.path);
            //flag.memory.buildRoad = false;
        }else{
            flag.memory.buildRoad = false;
        }
        
    },
    
    roadMaintenance:function(flag, dest){
        var origin = flag.pos;
        var destination = dest;
        try{
            this.pdeb('RoadMaint: '+flag.name);
            var path = this.buildPath(origin,destination);
            this.pdeb('Flag:'+flag.name+' O:'+origin+' D:'+destination+' path:'+path);
            if(path != null){
                var actualPath = path.path;
                this.buildRoads(actualPath);
            }else{
                this.pdeb('Error in roadMaintenance for flag:'+flag.name+' No valid path found');
                Game.notify('Error in roadMaintenance for flag:'+flag.name+' No valid path found');
            }
            
        }catch(err){
            Game.notify('Error in roadMaintenace for flag: '+flag.name+ 'room'+flag.pos.roomName);
        }
        
    },
    buildPath:function(src, dest){
        var r = null;
        if(src && dest){
            r = PathFinder.search(src,dest,{plainCost:2, swampCost:4});
        }else{
            this.pdeb('Error in buildPath call: '+src+':'+dest);
            Game.notify('Error in buildPath call: '+src+':'+dest);
        }
        return r;
    },
    buildRoads:function(path){
        var i = 0;
        var roadsBuilt = 0;
        var roadsFound = 0;

        try{
        console.log('Received: '+path.length);
        for( i = 0; i<path.length ; i++){
            var roomPos = path[i];
            roomPos = new RoomPosition(roomPos.x,roomPos.y,roomPos.roomName);
            //console.log("buildRoads:"+roomPos);
            if(roomPos){
                //console.log(roomPos);
                /*if(constructionSites && constructionSites.length>0 || roads && roads.length>0){
                    //continue;
                }else{
                    var r = roomPos.createConstructionSite(STRUCTURE_ROAD);
                    if(r == ERR_FULL){
                        return;
                    }
                    roadsBuilt++;
                }*/
                
                var roads = roomPos.lookFor(LOOK_STRUCTURES);
                if(roads && roads.length){
                    roadsFound++;
                }else{
                    var constructionSites = roomPos.lookFor(LOOK_CONSTRUCTION_SITES);
                    if(constructionSites && constructionSites.length>0){
                        //continue;
                    }else{
                        var r = roomPos.createConstructionSite(STRUCTURE_ROAD);
                        if(r == ERR_FULL){
                            return;
                        }
                        roadsBuilt++;
                    }
                }
                //console.log('buildRoad+'+roomPos+'end');

            }
            console.log('Ordered '+roadsBuilt+' new Roads');
        }
        }catch(error){
            console.log(' Error in buildRoad: '+error+' path.length'+path.length+' at index:'+i);
            Game.notify(' Error in buildRoad: '+error+' path.length'+path.length);
        }
        return roadsBuilt;
    },
    
    runSmartRaider:function(flag){
        if(Game.time%5!=0){
            return;
        }
        if(flag.room){
            var harvestQuota = flag.room.memory.harvestQuota;
            if(this.roomDangerCheck(flag.room) && harvestQuota && harvestQuota > 70000 ){
                //Summon Raider
                
            }else{
                return;
                
            }
            
        }
        var raider = _.filter(Game.creeps, (creep) => creep.memory.role == 'military' && creep.memory.subRole == 'raider' && creep.memory.flagName == flag.name );
        
        if(!flag.memory.partySize){
            flag.memory.partySize = 1;
        }
        
        var partySize = flag.memory.partySize;
        if(raider.length<partySize){
              var spawner;
                var mSpawn = flag.memory.spawn;
                if(mSpawn ){
                    
                    spawner = Game.spawns[mSpawn];
                    
                }else{
                    spawner =  this.getSpawner(flag);
                }
            this.pdeb('Flag: '+flag.name+' Need a raider, spawner: '+spawner);
            if(spawner.spawning){
                this.pdeb('Attack Flag: Spawner busy');
            }else{
            var body = flag.memory.useHeavy ? [MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK] : [MOVE,MOVE,ATTACK,RANGED_ATTACK];
                
                
                var err = spawner.canCreateCreep(body,undefined,{});

                if(err == 0){
                    var res = spawner.createCreep(body,undefined,{
                        role: 'military', subRole: 'raider', flagName: flag.name , dest : flag.pos
                    });
                    this.pdeb('Flag:'+flag.name+' Raid Flag: Spawn Res: '+res);
                }else{
                    this.pdeb('Flag:'+flag.name+' Raid Flag: err'+err);
                }
            }
            
            
        }else{
            //this.pdeb('Flag:'+flag.name+ ' Have a raider!'+JSON.stringify(raider));
        }
        
        
    },
    runRaider:function(flag){
        if(Game.time%5!=0){
            return;
        }
        var raider = _.filter(Game.creeps, (creep) => creep.memory.role == 'military' && creep.memory.subRole == 'raider' && creep.memory.flagName == flag.name );
        
        if(!flag.memory.partySize){
            flag.memory.partySize = 1;
        }
        
        var partySize = flag.memory.partySize;
        if(raider.length<partySize){
              var spawner;
                var mSpawn = flag.memory.spawn;
                if(mSpawn ){
                    
                    spawner = Game.spawns[mSpawn];
                    
                }else{
                    spawner =  this.getSpawner(flag);
                }
            this.pdeb('Flag: '+flag.name+' Need a raider, spawner: '+spawner);
            if(spawner.spawning){
                this.pdeb('Attack Flag: Spawner busy');
            }else{
            var body = flag.memory.useHeavy ? [MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK] : [MOVE,MOVE,ATTACK,RANGED_ATTACK];
                
                
                var err = spawner.canCreateCreep(body,undefined,{});

                if(err == 0){
                    var res = spawner.createCreep(body,undefined,{
                        role: 'military', subRole: 'raider', flagName: flag.name , dest : flag.pos
                    });
                    this.pdeb('Flag:'+flag.name+' Raid Flag: Spawn Res: '+res);
                }else{
                    this.pdeb('Flag:'+flag.name+' Raid Flag: err'+err);
                }
            }
            
            
        }else{
            //this.pdeb('Flag:'+flag.name+ ' Have a raider!'+JSON.stringify(raider));
        }
        
        
    },
   initRemoteHarvestFlag:function(flag){
        try{
            //TODO Add Support for nearest container rather than nearest storage settings.

            //console.log('Flag init called'+flag.pos);
            /*if(Game.time%5 !=0){
                return;
            }
            */
            if(!flag.room) {
                
                return;
            }
            
            var controller = flag.room.controller;
            var isReserved = controller && controller.reservation;
            var owned = controller && controller.my; 
            var fullMiner = isReserved || owned ? true : false;
            
            flag.memory.fullMiner = fullMiner;
            
            //console.log(flag.name+' requires Full Miner: '+fullMiner);
            /*if((Game.time%5)!=0){
                //console.log('Game Time: '+Game.time + ' mod : '+Game.time%5);
                return;
            }*/
            if(this.roomDangerCheck(flag)){
                if(flag.room.memory.harvestQuota && flag.room.memory.harvestQuota >1000){
                    flag.room.memory.lastAttack = Game.time;
                    var harvested = flag.room.memory.harvestQuota;
                    flag.room.memory.harvestQuota = 0;
                    Game.notify('Room:'+flag.room+' attacked after harvesting: '+harvested+ ' tick '+Game.time);
                }
                return;
            }

            var noMiners = flag.memory.noMiner;
            if(flag.room && flag.room.controller){
                //console.log('Flag: '+flag.name+ ' Room: '+flag.room+ ' ControllerInfo:'+flag.room.controller);
                //TODO Needs to check for controller status (And memorize for a few ticks) to change required creeps.
            }


            var miners = this.getMemory(flag).miners;
            var newMiners = new Array();
            var useMiner = flag.memory.useMiner ? flag.memory.useMiner : true;
            flag.memory.useMiner = useMiner;
            if(miners && miners.length >0 ){
                //console.log('Have '+miners.length+ "J"+JSON.stringify(miners));
                for(var miner in miners){
                    //console.log('Flag Miner: '+miners[miner]+' Status'+JSON.stringify(Game.creeps[miners[miner]]));
                    var miner2 = Game.creeps[miners[miner]];
                    
                    if(!Game.creeps[miners[miner]]){
                        flag.memory.miners = null;
                    }
                }
                /*
                 if(miners.length != newMiners.length){
                 flag.memory.miners = newMiners;
                 }*/
                //console.log("Have Miner"+JSON.stringify(miners));
            }else{
                console.log("Flag"+flag.name+"Request Miner");
                var spawner;
                var mSpawn = flag.memory.spawn;
                if(mSpawn ){
                    
                    spawner = Game.spawns[mSpawn];
                    
                }else{
                    spawner =  this.getSpawner(flag);
                }
                
                //spawner = Game.spawns["TheSpawn"];
                //console.log(JSON.stringify(spawner));
                var err = 0;
                if(fullMiner &&(err = spawner.canCreateCreep([WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE], undefined, {role: 'remoteMiner'}))==0){
                    var newGuy = spawner.createCreep([WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE], undefined, {role: 'remoteMiner', remoteMiningFlag: flag.name});
                    //var newGuy = 'BOB!';
                    flag.memory.miners = flag.memory.miners ? flag.memory.miners : new Array();
                    flag.memory.miners.push(newGuy);
                    //console.log("Could build miner:"+JSON.stringify(flag.memory.miners)+"\n\n\n\n");
                }else if(!fullMiner && (err = spawner.canCreateCreep([WORK,WORK,WORK,MOVE,MOVE,MOVE], undefined, {role: 'remoteMiner'}))==0){
                    var newGuy = spawner.createCreep([WORK,WORK,WORK,MOVE,MOVE,MOVE], undefined, {role: 'remoteMiner', remoteMiningFlag: flag.name});
                    //var newGuy = 'BOB!';
                    flag.memory.miners = flag.memory.miners ? flag.memory.miners : new Array();
                    flag.memory.miners.push(newGuy);
                    //console.log("Could build miner:"+JSON.stringify(flag.memory.miners)+"\n\n\n\n");
                }
                console.log('Remote Harvester flag '+flag.name+' error ERR'+err);
                return;
            }

        }catch(err){
            console.log('Exception in InitFlagMiner On flag'+flag.name+' for room'+flag.pos.roomName+' \n'+err+'\n\n');
            Game.notify('Exception in InitFlagMiner On flag'+flag.name+' for room'+flag.pos.roomName+' \n'+err+'\n\n',1);
        }

        //var ferries = this.getMemory(flag).ferries;
        var targetFerries = flag.memory.targetFerries ? flag.memory.targetFerries : 0;
        flag.memory.targetFerries = targetFerries;
        var remoteBase = flag.memory.remoteBase;
        //console.log('ferries'+ferries);
        var ferries = _.filter(Game.creeps, (creep) => creep.memory.role == 'ferry' && creep.memory.remotePickup.x == flag.pos.x && creep.memory.remotePickup.y == flag.pos.y && flag.pos.roomName == creep.memory.remotePickup.roomName);
        //console.log('Existing Ferries: '+JSON.stringify(ferries));
        
        if(ferries){
            //console.log('Have ferries');
            if(ferries.length<targetFerries){
                // console.log('Current Ferries on flag: '+flag.name+ ' Active:'+ferries.length+' Desired' +targetFerries);
                this.spawnFerry(flag,remoteBase);
            }
        }else{
            //flag.memory.ferries = new Array();
            //this.spawnFerry(flag);
            console.log('RemoteHarvest flag: '+flag.name+' Ferries query problem ERR'+err);
        }
        if(Game.time%10 == 0 && remoteBase){
            var ob = Game.getObjectById(remoteBase);
            this.pdeb('Building Roads: Flag:'+flag.name+' to:'+ob.pos);
             this.roadMaintenance(flag,ob.pos);
            
        }else{
           // Game.notify('Error. RemoteBase not set for flag: '+flag.name);
        }
        //var sources = flag.pos.room(FIND_SOURCES);

        //FIND SOURCES IN ROOM ASK FOR REMOTE MINERS AND REMOTE FERRY
        //DEFINE MEMORY VARS CHECK WHEN ASSIGNED CREEPS ARE OLD DETECT BOOGIES IN ROOM


        //flag.memory.type = 'REMOTE_HARVEST';
    },
    
    
    spawnFerry:function(flag,remote){
        var useOptimized = flag.memory.roadsAvailable  ? true : false;
        if(!useOptimized){
            flag.memory.roadsAvailable = false;
        }
        
        var spawner = null;
        var mSpawn = flag.memory.spawn;
        if(mSpawn ){
            spawner = Game.spawns[mSpawn];
        }else{
            spawner =  this.getSpawner(flag);
        }
        
        var fullBody = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        var optiBody =  [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        var body = useOptimized ? optiBody : fullBody;
        if((err = spawner.canCreateCreep(body, undefined, {role: 'ferry'}))==0){
            var newGuy = spawner.createCreep(body, undefined, {role: 'ferry', remotePickup: flag.pos , remoteFlag: flag.name, remoteBase: remote});
            //var newGuy = 'BOB!';
            //flag.memory.ferries = flag.memory.ferries ? flag.memory.ferries : new Array();
            //flag.memory.ferries[] = newGuy;
            //console.log("Could build ferries:"+JSON.stringify(flag.memory.ferries)+"\n\n\n\n");
        }

    },
    getAssignedMiners:function(flag){
        var miners = this.getMemory(flag).miners;
    },

    summonHealer:function(flag){

        var healer = _.filter(Game.creeps, function(creep) { creep.memory.role == 'military' && creep.memory.subRole == 'healer' && creep.memory.flagName == flag.name });
        this.pdeb('Healer Pop: '+JSON.stringify(healer));
        if(healer && healer.length<1){
            var body = [HEAL,MOVE];
            var sp = this.getSpawner(flag);
            var body = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL];
            var err = sp.createCreep(body,undefined,{ role:'military', subRole: 'healer' , flagName: flag.name , dest: flag.pos });
            this.pdeb('Error: '+err);
            //var res = sp.createCreep(body,undefined,{ role:'military', subRole: 'healer' , flagName: flag.name , dest: flag.pos });
            // this.pdeb('Debugging Heal Summon: Healers: '+healers.length+'Res:'+res);
        }else{

        }

    },

    runGuardRoom:function(flag){
        //this.pdeb('Defense flag: start');
        var peaceTime = flag.memory.peace;
        /*if(peaceTime && Game.time%5!=0){
         return;
         }
         */
        if(!flag.room){
            //Request Vision

        }

        var danger = this.roomDangerCheck(flag);
        //this.pdeb('Guard flag: dLeve:'+danger);

        flag.memory.alert = true;
        //Send Message to Human
        var boogies = flag.memory.boogies;
        if(boogies){
            if(boogies.length){
                var owner = 'Invader';
                //ar owner = boogies[0] && boogie[0].owner && boogie[0].owner.username ? boogie[0].owner.username : 'Invader';
                if(owner == 'Invader'){
                    Game.notify('NPC Invader creeps detected in room:'+flag.room+' .',10);
                }else{
                    Game.notify('OMG!! Human invader: '+owner+' '+boogies.length + ' raiders detected',1);
                }
            }

        }else{

        }
        //Evaluate Threat
        //Have Defenders?
        //call for response
        //var ferries =   _.filter(Game.creeps, (creep) => creep.memory.role == 'ferry' && creep.memory.remotePickup.x == flag.pos.x && creep.memory.remotePickup.y == flag.pos.y && flag.pos.roomName == creep.memory.remotePickup.roomName);
        console.log('Might need defenders');
        var defenders = _.filter(Game.creeps, function(creep) { creep.memory.role == 'military' && creep.memory.subRole == 'defender' && creep.memory.flagName == flag.name && creep.memory.dest.x == flag.pos.x && creep.memory.dest.y == flag.pos.y && flag.pos.roomName == creep.memory.dest.roomName});
        var healers = _.filter(Game.creeps, function(creep) { creep.memory.role == 'military' && creep.memory.subRole == 'healer' && creep.memory.flagName == flag.name});

        console.log('Defense Flag: Res: '+JSON.stringify(boogies)+ ' Active defenders: '+JSON.stringify(defenders)+ 'Healers:'+JSON.stringify(healers));
        /*var defendersI = new Array();
         for(var d in defenders){

         }
         */
        //flag.memory.defenders = defenders;
        if(healers.length<1){
            console.log('GuardRoom Flag: Want to create a healer and can\'t');
            var sp = this.getSpawner(flag);
            var err = 0;
            err = sp.createCreep([TOUGH,TOUGH,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE],undefined,{ role:'military' , subRole : 'healer' , flagName :flag.name, dest : flag.pos});
            this.pdeb('GuardRoom Flag Healer res: '+err);

        }else if(defenders && defenders.length>=2){

        }else{
            var sp = this.getSpawner(flag);
            if(1==2){//boogies && boogies.length && boogies[0].getActiveBodyParts(ATTACK)>3){ //TOFIX
                console.log('Need a large creep');
            }else{
                vardefenderMind = { role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos };
                var p = sp.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{ role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos });
                /*
                 var r = sp.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{ role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos });
                 //var r = sp.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{ role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos });
                 console.log('Defense flag: '+flag.name+ ' calling creep:'+r);
                 if(sp.canCreateCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{})){
                 var r = sp.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{ role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos });
                 console.log('Defense flag: '+flag.name+ ' calling creep:'+r);
                 }else if(sp.canCreateCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{})){
                 var r = sp.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{ role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos });
                 console.log('Defense flag: '+flag.name+ ' calling creep:'+r);
                 }else if(sp.canCreateCreep([MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{})){
                 var r = sp.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{ role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos });
                 console.log('Defense flag: '+flag.name+ ' calling creep:'+r);
                 }*/
            }
        }







    },

    runDefend:function(flag){
        this.pdeb('Defense flag: start'+flag.name);
        var peaceTime = flag.memory.peace;
        /*if(peaceTime && Game.time%5!=0){
         return;
         }
         */
        if(!flag.room){
            //Request Vision

        }

        var danger = this.roomDangerCheck(flag);
        //this.pdeb('Defense flag: dLeve:'+danger);
        if(danger){
            flag.memory.alert = true;
            //Send Message to Human
            var boogies = flag.memory.boogies;
            if(boogies){
                if(boogies.length){
                    var owner = 'Invader';
                    //ar owner = boogies[0] && boogie[0].owner && boogie[0].owner.username ? boogie[0].owner.username : 'Invader';
                    if(owner == 'Invader'){
                        Game.notify('NPC Invader creeps detected in room:'+flag.room+' .',10);
                    }else{
                        Game.notify('OMG!! Human invader: '+owner+' '+boogies.length + ' raiders detected',1);
                    }
                }

            }else{

            }
            //Evaluate Threat
            //Have Defenders?
            //call for response
            //var ferries =   _.filter(Game.creeps, (creep) => creep.memory.role == 'ferry' && creep.memory.remotePickup.x == flag.pos.x && creep.memory.remotePickup.y == flag.pos.y && flag.pos.roomName == creep.memory.remotePickup.roomName);
            console.log('Might need defenders');
            var defenders = _.filter(Game.creeps, function(creep) { creep.memory.role == 'military' && creep.memory.subRole == 'defender' && creep.memory.flagName == flag.name && creep.memory.dest.x == flag.pos.x && creep.memory.dest.y == flag.pos.y && flag.pos.roomName == creep.memory.dest.roomName});
            console.log('Defense Flag: Res: '+JSON.stringify(boogies)+ ' Active defenders: '+JSON.stringify(defenders));
            /*var defendersI = new Array();
             for(var d in defenders){

             }
             */
            //flag.memory.defenders = defenders;
            if(defenders && defenders.length>=1){

            }else{
                var sp = this.getSpawner(flag);
                if(1==2){//boogies && boogies.length && boogies[0].getActiveBodyParts(ATTACK)>3){ //TOFIX
                    console.log('Need a large creep');
                }else{
                    var heavybody = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL];
                    var r = sp.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL],undefined,{ role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos });

                    // var r = sp.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{ role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos });

                    //var r = sp.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{ role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos });
                    console.log('Defense flag: '+flag.name+ ' calling creep:'+r);
                    if(sp.canCreateCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{})){
                        var r = sp.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{ role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos });
                        console.log('Defense flag: '+flag.name+ ' calling creep:'+r);
                    }else if(sp.canCreateCreep([MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{})){
                        var r = sp.createCreep([MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],undefined,{ role : 'military' , subRole : 'defender', flagName :flag.name, dest : flag.pos });
                        console.log('Defense flag: '+flag.name+ ' calling creep:'+r);
                    }
                }
            }

        }else {
            if(flag.memory.alert == true){
                //Danger finished
                flag.memory.alert = false;
                var defenders = _.filter(Game.creeps, function(creep) {creep.memory.role == 'military' && creep.memory.subRole == 'defender' && creep.memory.flagName == flag.name
                });

                if (defenders) {
                    Game.notify('Engagement finished in room :' + flag.room + ' recycling defenders:' + defenders);
                    for (var def in defenders) {
                        var defender = defenders[def];
                        defender.memory.role = 'recycle';
                        console.log('Recycling Defender: ' + defender);
                    }
                }

            }
        }




    },
    runClaimRoomFlag:function(flag){
        try {
            console.log('Claim Room Log');
            if (!flag.room) {
                console.log('Claim Room No Vision on desired Room. Please provide vision');
                return;
            }

            //console.log('Reserve Room LogRoom Controller Status: ' + JSON.stringify(flag.room.controller));
            var controller = flag.room.controller;
            var isReserved = controller.reservation;

            var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer' && creep.memory.flagName == flag.name );

            var claimerCount = 0;
            this.pdeb('Claim room Claimers: '+claimers);
            if(claimers && claimers.length<1){
                
                
                var spawner = this.getSpawner(flag);
                if(!spawner.spawning){
                    this.pdeb('Attempting to spawn Claimer: '+spawner.createCreep([CLAIM,MOVE],undefined,{ role: 'claimer', task:'claim' , dest: flag.pos, flagName: flag.name}));
                }
            }else{
                //this.pdeb('Claimers available');
            }

        }catch (e){
            console.log('Exception occurred in RunClaimRoomFlag: '+e);
        }
        //console.log('Reserve Room Log End');
    },
   runReserveRoomFlag:function(flag){
        try {
            //console.log('Reserve Room Log');
            if (!flag.room) {
                //console.log('Reserve Room No Vision on desired Room. Please provide vision');
                return;
            }

            //console.log('Reserve Room LogRoom Controller Status: ' + JSON.stringify(flag.room.controller));
            var controller = flag.room.controller;
            var isReserved = controller.reservation;
            var claimers = null;
            var needClaimer = true;
            if(isReserved && isReserved.ticksToEnd>4000){
                return;
            }else if(isReserved && isReserved.ticksToEnd<=4000){
               claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer' && creep.memory.flagName == flag.name );
            }else{
                claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer' && creep.memory.flagName == flag.name );
            }
            flag.memory.claimers = claimers;
            if(claimers && claimers.length<1){
                var spawner;
                var mSpawn = flag.memory.spawn;
                if(mSpawn ){
                    
                    spawner = Game.spawns[mSpawn];
                    
                }else{
                    spawner =  this.getSpawner(flag);
                }
                if(!spawner.spawning){
                    this.pdeb('Attempting to spawn Claimer: '+spawner.createCreep([CLAIM,CLAIM,MOVE,MOVE],undefined,{ role: 'claimer', task:'reserve' , dest: flag.pos, flagName: flag.name}));
                }
            }
            
            /*
            if(!isReserved){
                //Must Reserve
                //this.pdeb('Will Reserve Controller. About to check if I have creeps on the way');
                needClaimer = true;
            }else{
                //this.pdeb('Is the controller sufficiently reserved?'+JSON.stringify(isReserved));
                if(isReserved.ticksToEnd <4000){
                    needClaimer = true;
                }
            }
            */
           

        }catch (e){
            console.log('Exception occurred in RunReserveRoomFlag: '+e);
            Game.notify('Exception in flag: '+flag.name+' room:'+flag.pos.roomName+'runreserveroom: '+e);
        }
        //console.log('Reserve Room Log End');
    },


    runVisionFlag:function(flag){
        if(flag.room){
            return;
        }
        
        var scouts = _.filter(Game.creeps, (creep) => creep.memory.role == 'scout' && creep.memory.dest.x == flag.pos.x && creep.memory.dest.y == flag.pos.y && flag.pos.roomName == creep.memory.dest.roomName);
        //console.log('Scouts '+JSON.stringify(scouts));
        if(scouts && scouts.length==0){
            var mSpawn = flag.memory.spawn;
            var getScout;
            if(mSpawn){
                getScout = Game.spawns[mSpawn];
            }else{
                getScout = this.getSpawner(flag);
            }
            
            
            //var getScout = this.getSpawner(flag);
            // getScout.createCreep([MOVE],undefined,{role: 'scout', dest: flag.pos});
            console.log('Scout Possible: '+getScout.createCreep([MOVE],undefined,{role: 'scout', dest: flag.pos}));

        }
    },
    
     runRemoteBuildFlag:function(flag){
         if(Game.time%2 !=0){
         return;
         }
        
         try{
         
        // console.log('Remote Builders Start checks: '+flag.name);//+'\n\n\n\n\n');
        var remotes = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder' && creep.memory.flagName == flag.name && creep.memory.dest.x == flag.pos.x && creep.memory.dest.y == flag.pos.y && flag.pos.roomName == creep.memory.dest.roomName);
        var defaultN = 1;
        var rLength = remotes ? remotes.length : 0;
        
        if(flag.room){
            var sites = roomMemory.getConstructionSites(flag.room);
            var sitesLength = sites ? sites.length : 0;
            defaultN = sites && sites.length ? Math.ceil((sites.length/10)) : 1;
            //defaultN = 1; //TODO Remove this once economy is stable again
           // console.log('Remote Builders: Flag: '+flag.name+' Room: '+flag.pos.roomName+'SiteCount: '+sitesLength+' Computed Builders Needed'+defaultN + ' current pop: '+rLength);

        }
        var minimumN = flag.memory.minimumN ? flag.memory.minimumN : 1;
        //console.log('Remote Builders '+JSON.stringify(remotes));
       
        if(flag.memory.overrideNumber === undefined){
            flag.memory.overrideNumber = 0;
        }
        var overrideNumber = flag.memory.overrideNumber;
        if(remotes && remotes.length < defaultN || remotes.length < overrideNumber){
            var getRemote;
            var mSpawn = flag.memory.spawn;
            if(mSpawn){
                getRemote = Game.spawns[mSpawn];
            }else{
                getRemote = this.getSpawner(flag);
                flag.memory.spawn = getRemote.name;
            }
            
            var mSpawn = flag.memory.spawn;
            var getRemote;
            if(mSpawn){
                getRemote = Game.spawns[mSpawn];
            }else{
                getRemote = this.getSpawner(flag);
            }
            //var getRemote = this.getSpawner(flag);
            // getScout.createCreep([MOVE],undefined,{role: 'scout', dest: flag.pos});
            if(flag.memory.extraMove === undefined){
                flag.memory.extraMove = false;
            }
            var needsExtraMove = flag.memory.extraMove;
            var body = [MOVE, MOVE, WORK, CARRY];
            if(defaultN==1 && (sites && sitesLength==0)) {
                
                
            }else {
                body = needsExtraMove ? [MOVE, MOVE,MOVE, MOVE,WORK,WORK, CARRY,CARRY] : [MOVE, MOVE,WORK,WORK, CARRY,CARRY];
                
            }
             console.log('RemoteBuilder Possible: ' + getRemote.createCreep(body, undefined, {
                        role: 'remoteBuilder',
                        flagName: flag.name,
                        dest: flag.pos
                    }));
                    /*
            if(defaultN==1 && (sites && sitesLength==0)) {
                console.log('RemoteBuilder Possible: ' + getRemote.createCreep([MOVE, MOVE, WORK, CARRY], undefined, {
                        role: 'remoteBuilder',
                        flagName: flag.name,
                        dest: flag.pos
                    }));
            }else{
                
                console.log('RemoteBuilder Possible: ' + getRemote.createCreep([MOVE, MOVE,MOVE, MOVE,WORK,WORK, CARRY,CARRY], undefined, {
                        role: 'remoteBuilder',
                        flagName: flag.name,
                        dest: flag.pos
                    }));
            }
            */
        }else if(remotes && rLength>=defaultN){
            //this.pdeb('Remote builder: have sufficient worker creeps in room'+flag.pos.roomName);
        }else{
            this.pdeb('Remote builder flag: strange state');
        }
        // this.pdeb('End of remote builder');
         }catch(err){
             this.pdeb('Error in RemoteFlag: '+flag.name+' Room'+flag.pos.roomName+' error: '+err);
             Game.notify('Error in RemoteFlag: '+flag.name+' Room'+flag.pos.roomName+' error: '+err);             
         }
    },
    runRemoteBuildFlagOld:function(flag){
        /* if(Game.time%5!=0){
         return;
         }
         */
        // console.log('Remote Builders Start checks: '+flag.name);//+'\n\n\n\n\n');
        var remotes = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder' && creep.memory.flagName == flag.name && creep.memory.dest.x == flag.pos.x && creep.memory.dest.y == flag.pos.y && flag.pos.roomName == creep.memory.dest.roomName);
        var defaultN = 1;
        var rLength = remotes ? remotes.length : 0;

        if(flag.room){
            var sites = roomMemory.getConstructionSites(flag.room);
            var sitesLength = sites ? sites.length : 0;
            defaultN = sites && sites.length ? Math.ceil((sites.length/10)) : 1;
            //defaultN = 1; //TODO Remove this once economy is stable again
            console.log('Remote Builders: Flag: '+flag.name+' Room: '+flag.pos.roomName+'SiteCount: '+sitesLength+' Computed Builders Needed'+defaultN + ' current pop: '+rLength);

        }
        var minimumN = flag.memory.minimumN ? flag.memory.minimumN : 1;
        //console.log('Remote Builders '+JSON.stringify(remotes));

        if(remotes && remotes.length < defaultN){
            var getRemote = this.getSpawner(flag);
            // getScout.createCreep([MOVE],undefined,{role: 'scout', dest: flag.pos});
            if(defaultN==1 && (sites && sitesLength==0)) {
                console.log('RemoteBuilder Possible: ' + getRemote.createCreep([MOVE, MOVE, WORK, CARRY], undefined, {
                        role: 'remoteBuilder',
                        flagName: flag.name,
                        dest: flag.pos
                    }));
            }else{
                console.log('RemoteBuilder Possible: ' + getRemote.createCreep([MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY,MOVE,MOVE,MOVE], undefined, {
                        role: 'remoteBuilder',
                        flagName: flag.name,
                        dest: flag.pos
                    }));
            }

        }else if(remotes && rLength>=defaultN){
            //this.pdeb('Remote builder: have sufficient worker creeps in room'+flag.pos.roomName);
        }else{
            this.pdeb('Remote builder flag: strange state');
        }
        // this.pdeb('End of remote builder');

    },
    runEnergyFlag:function(flag){
        var loaders = _.filter(Game.creeps, (creep) => creep.memory.role == 'loader' && creep.memory.flagName == flag.name );
        if(loaders && loaders.length){
            //console.log('Have a loader creep: '+loaders[0]);
        }else{
            var spawner = this.getSpawner(flag);
            if(!spawner.spawning){
                //console.log('Can Spawn Loader'+spawner.canCreateCreep([MOVE,CARRY],undefined, {role: 'loader', flagName: flag.name , dest: flag.pos}));
                spawner.createCreep([MOVE,CARRY],undefined, {role: 'loader', dest: flag.pos ,flagName: flag.name});
            }
        }

    },

    initMiner: function (flag) {
        try{


            var sources = flag.pos.findInRange(FIND_SOURCES,1);
            if(sources && sources.length<1){
                this.pdeb('Miner flag error: '+flag.name+' No source in range 1');
                Game.notify('Misplaced Miner flag: '+flag.name);
                return;
            }
            var spawner;
            var sourceToMine = sources[0];
            var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.flagName == flag.name );
            flag.memory.miners = miners;
            if(miners && miners.length>0){
                this.pdeb('Flag Miner: '+flag.name+' have: '+ miners.length+' miners');
            }else{
                
                var mSpawn = flag.memory.spawn;
                if(mSpawn ){
                    
                    spawner = Game.spawns[mSpawn];
                    
                }else{
                    spawner =  this.getSpawner(flag);
                }
                if(spawner.spawning){
                    return;
                }
                
                var res = null;
                var err = null;
                var cap = flag.room.energyCapacityAvailable;
                if( cap>=750){
                                       res = spawner.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE],undefined,{ role: 'miner', dest: flag.pos ,flagName: flag.name});
 
                }else if(cap>=650){
                                        res = spawner.createCreep([WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE],undefined,{ role: 'miner', dest: flag.pos ,flagName: flag.name});

                }else if(cap>=450){
                                        res = spawner.createCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE],undefined,{ role: 'miner', dest: flag.pos ,flagName: flag.name});

                }else if(cap>=300){
                                        res = spawner.createCreep([WORK,WORK,CARRY,MOVE],undefined,{ role: 'miner', dest: flag.pos ,flagName: flag.name});

                }else{
                    err = 'Less than 300 eCap';
                }
                
                Game.notify('InitMiner: '+flag.name+ 'Err:'+err+' Res:  '+res );
            }
        }catch(err){
            this.pdeb('Error in InitMiner flag: '+flag.name+'+err'+err);
            Game.notify('Error in InitMiner flag:'+flag.name+' err'+err+ ' '+JSON.stringify(spawner));
        }
    },
    run:function(flag){
        if(!flag.memory.type){
            var flagName = flag.name;
            //console.log('FlagName: '+flagName);
            if(flagName.startsWith('HarvestRoom')){
                this.initRemoteHarvestFlag(flag);
            }else if(flagName.startsWith('Miner')){
                this.initMiner(flag);
            }else if(flagName.startsWith('Vision')){
                this.runVisionFlag(flag);
            }else if(flagName.startsWith('Drain')){

            }else if(flagName.startsWith('GuardRoom')){
                this.runGuardRoom(flag);
            }else if(flagName.startsWith('Defend')){
                this.runDefend(flag);
            }else if(flagName.startsWith('Conquer')){

            }else if(flagName.startsWith('Attack')){
                this.runAttack(flag);
            }else if(flagName.startsWith('RemoteBuilder')){
                this.runRemoteBuildFlag(flag);
            }else if(flagName.startsWith('SupplyEnergy') || flag.color==COLOR_YELLOW){
                this.runEnergyFlag(flag);
            }else if(flagName.startsWith('MockAttack')){
                this.runMockAttack(flag);
            }else if(flagName.startsWith('Dismantle')){
                this.dismantleFlag(flag);
            }else if(flagName.startsWith('SneakyUpgrade')){
                this.quickUpgrader(flag);
            }else if(flagName.startsWith('RangedAttack')){
                this.runRangedAttacker(flag);
            }else if(flagName.startsWith('Raid')){
               // console.log('FlagName: '+flagName);
                this.runRaider(flag); //TODO Fix Flag Naming issues related to raider/defender/guards
//                this.runSmartRaider(flag);
            }else if(flagName.startsWith('SummonHealer')){
                this.summonHealer(flag);
            }else if(flagName.startsWith('ClaimRoom')){
                // var claimRoom = require('flag.claimRoom');
                // claimRoom.run(flag);
                this.runClaimRoomFlag(flag);
            }else if(flagName.startsWith('ReserveRoom')){
                this.runReserveRoomFlag(flag);
            }else if(flagName.startsWith('Pathing')){
                this.pathingFlag(flag);
                
            }
        }

        /**Vediamo un po' la flag memory deve contenere il suo tipo */


    },

    dismantleFlag:function(flag){
        var workers = _.filter(Game.creeps, (creep) => creep.memory.role == 'military' && creep.memory.subRole == 'dismantler' && creep.memory.flagName == flag.name );
        flag.memory.reqWorkers = flag.memory.reqWorkers ? flag.memory.reqWorkers : 0;

        if(workers.length < flag.memory.reqWorkers){
            var sp = this.getFreeSpawner(flag);
            if(sp && !sp.spawning){
                var err = 0;
                if((err =sp.canCreateCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{}))==0){
                    var res = sp.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{
                        role: 'military', subRole: 'dismantler', flagName: flag.name , dest : flag.pos
                    });
                    console.log('Dismantle flag: Spawning: '+res);
                }else{
                    console.log('Dismantle flag: SP Err'+err);
                }
            }else{
                console.log('Dismantle Flag: all spawners busy.');
                return;
            }

            /*
             var sp = this.getSpawner(flag);
             if(sp.spawning) {
             console.log('Dismantle Flag: spawner busy.');
             return;
             }else{
             var err = 0;
             if((err =sp.canCreateCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{}))==0){
             var res = sp.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{
             role: 'military', subRole: 'dismantler', flagName: flag.name , dest : flag.pos
             });
             console.log('Dismantle flag: Spawning: '+res);
             }else{
             console.log('Dismantle flag: SP Err'+err);
             }
             }
             */
        }else{
            for(var c in workers){
                c = workers[c];
                // c.memory.dest = flag.pos;
                // c.memory.role = 'recycle';
                //c.memory.role = 'builder';
            }
        }


    },

    phaseOne: function (flag) {

    },

    runAttack:function(flag){

        var attacker = _.filter(Game.creeps, (creep) => creep.memory.role == 'military' && creep.memory.subRole == 'attacker' && creep.memory.flagName == flag.name );
        var reqAttacker = 1;
        if(attacker.length<1){
            var sp = this.getSpawner(flag);
            if(sp.spawning){
                this.pdeb('Attack Flag: Spawner busy');
            }else{
                if(sp.canCreateCreep([TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{})){
                    var res = sp.createCreep([TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{
                        role: 'military', subRole: 'attacker', flagName: flag.name , dest : flag.pos
                    });
                }
            }
        }

    },
    runMockAttack:function(flag){
        //Required Stages
        var healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'military' && creep.memory.subRole == 'healer' && creep.memory.flagName == flag.name );
        var workers = _.filter(Game.creeps, (creep) => creep.memory.role == 'military' && creep.memory.subRole == 'dismantler' && creep.memory.flagName == flag.name );
        var defenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'military' && creep.memory.subRole == 'defender' && creep.memory.flagName == flag.name );
        var attacker = _.filter(Game.creeps, (creep) => creep.memory.role == 'military' && creep.memory.subRole == 'attacker' && creep.memory.flagName == flag.name );
        var claimer = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer' && creep.memory.subRole == 'claim' && creep.memory.flagName == flag.name );

        var reqHealers = 2;
        var reqWorkers = 2;
        var reqDefenders = 2;
        var reqAttackers= 2;
        var reqClaimers = 0;

        if(healers.length == reqHealers && workers.length == reqWorkers  && defenders.length == reqDefenders && attacker.length == reqAttackers && claimer.length == reqClaimers){
            flag.memory.requirementsMet = true;
        }else{
            //var
        }

        if(this.phaseOne(flag)){
            //RECRUIT TROOPS SEND MAIN ECO TO WARMODE:


        }





    },

    quickUpgrader:function(flag){
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.subRole == 'sneaky' && creep.memory.flagName == flag.name );
        var controller = flag.room.controller ? flag.room.controller : null;
        if(controller){
            //this.pdeb('Sneaky Upgrade controller found'+controller.ticksToDowngrade);
            if(controller.ticksToDowngrade<2000){
                this.pdeb('SneakyUpgrade Controller Room: '+flag.pos.roomName+' tick to decay: '+controller.ticksToDowngrade);
                if(upgraders.length<1){
                    this.pdeb('Controller Not enough upgraders');
                    var sp = this.getSpawner(flag);
                    if(sp.spawning){
                        this.pdeb('Upgrader Sneaky have to wait.');
                    }else{
                        // var r = sp.createCreep([TOUGH,TOUGH,TOUGH,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{ role: 'upgrader', subRole: 'sneaky', flagName: flag.name, dest: flag.pos  });
                        var r = sp.createCreep([WORK,CARRY,MOVE,MOVE],undefined,{ role: 'upgrader', subRole: 'sneaky', flagName: flag.name, dest: flag.pos  });

                        this.pdeb('Sneaky Upgrade: '+r);
                    }
                }else{
                    //Nothing to do.
                    this.pdeb('SneakyUpgrade Controller Room: '+flag.pos.roomName+' tick to decay: '+controller.ticksToDowngrade+' upgrader en route');
                }
            }

        }else{
            this.pdeb('Sneaky Upgrade no controller info');
        }

    },

    runFastidiousAttacker:function(flag){
        var attacker = _.filter(Game.creeps, (creep) => creep.memory.role == 'military' && creep.memory.subRole == 'defender' && creep.memory.flagName == flag.name );
        this.pdeb('RangedAttacker: ');
        if(attacker.length<1){
            this.pdeb('RangedAttacker: Spawning attacker: ');
            var sp = this.getSpawner(flag);
            var body = [TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL];
            var r = sp.createCreep(body,undefined,{ role: 'military', subRole: 'defender', flagName: flag.name, dest: flag.pos  });
            this.pdeb('RangedAttacker: Spawning attacker res: '+r);
        }else{
            this.pdeb('RangedAttacker: ');
        }

    },

    runRangedAttacker:function(flag){
        var attacker = _.filter(Game.creeps, (creep) => creep.memory.role == 'military' && creep.memory.subRole == 'defender' && creep.memory.flagName == flag.name );
        this.pdeb('RangedAttacker: ');
        if(attacker.length<1){
            this.pdeb('RangedAttacker: Spawning attacker: ');
            var sp = this.getSpawner(flag);

            var r = sp.createCreep([TOUGH,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK],undefined,{ role: 'military', subRole: 'defender', flagName: flag.name, dest: flag.pos  });
            this.pdeb('RangedAttacker: Spawning attacker res: '+r);
        }else{
            this.pdeb('RangedAttacker: ');
        }


    },
    getMemory:function(flag){
        if(!flag.memory){
            flag.memory = '';
        }
        return flag.memory;
    },
    getSpawner:function(flag){
        var spawner;
        var mSpawn = flag.memory.spawn;
        if(mSpawn ){
            spawner = Game.spawns[mSpawn];
                    
        }else{
            spawner =  this.getSpawnerOld(flag);
        }
        return spawner;


    },

    getSpawnerInRoom:function(flag){
        var spawner = null;
        if(flag.room && flag.room.controller && flag.room.controller.my){
            var spawners = roomMemory.getSpawnersInRoom(flag.room);
            for(var spawn in spawners) {
                spawn = spawners[spawn];
                if (!spawn.spawning) {
                }
                return spawn;
            }
        }else{
            return spawner;
        }
        return spawner;
    },
    getSpawnerOld:function(flag){
        return Game.spawns.Spawn;
        for(var spawn in Game.spawns){
            //console.log(JSON.stringify(spawn));
            return Game.spawns[spawn];
        }


    },

    getClosestSpawner:function(flag){
        var spawns = Game.spawns;
        var spawnArr = new Array();
        for(var sp in spawns){
            var spawn = spawns[sp];
            spawnArr.push(spawn);
        }



    },

    getFreeSpawner:function(flag){
        for(var spawn in Game.spawns){
            spawn = Game.spawns[spawn];
            console.log('GetFreeSpawner: Spawn: '+spawn.name+' Capacity:'+spawn.room.energyAvailable+
                ' Total:'+spawn.room.energyCapacityAvailable+' '+(spawn.spawning ? 'Busy ': 'Free' ));
            if(!spawn.spawning){
                return spawn;
            }
        }return null;
    },

    pdeb:function(text){
        console.log(text);
    }
};
module.exports = roleFlag;

