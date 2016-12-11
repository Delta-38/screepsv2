	var roleHarvester = require('role.harvester');
	var roleUpgrader = require('role.upgrader');
	var roleBuilder = require('role.builder');
	var roleMiner = require('role.miner');
	var roleRemoteMiner = require('role.remoteMiner');
	var utility = require('utility');
	var towers = require('role.towerControl');
	var roleDefense = require('role.defense');
	var roleFerry = require('role.ferry');
	var roleFlag = require('role.flag.old');
	var roleScout = require('role.scout');
	var roleLoader = require('role.loader');
	var roleExtractor = require('role.extractor');
	var roleRecycle = require('role.recycle');
	var profiler = require('profiler');
	var roleMilitary = require('role.military');
	var roleClaimer = require('role.claimer');
	global.roomMemory = require('roomMemory');
	var linkManager = require('linkManager');
	global.observerManager = require('observerManager');
	require('prototype.creep')();
	require('prototype.spawn')();
	require('prototype.flag')();
	global.util = require('global.util');
	var _ = require('lodash');
	profiler.enable();



	module.exports.loop = function () {
        var cpuUsedRep = "Cpu Report"+Game.cpu.getUsed();
        Object.defineProperty(OwnedStructure.prototype, "memory", {
        get: function () {
            if(!Memory.structures)
                Memory.structures = {};
            if(!Memory.structures[this.id])
                Memory.structures[this.id] = {};
            return Memory.structures[this.id];
        },
        configurable: true
        });

        cpuUsedRep = cpuUsedRep+"\n Cpu af incl: "+Game.cpu.getUsed();
	    PathFinder.use(true);
		//var creeps = Game.creeps;
		profiler.wrap(function() {
		// Main.js logic should go here.
	    
		gcTasks(5); //TODO Expand to cleanup dead flags 
		//testing(null);
        cpuUsedRep = cpuUsedRep+"\nafter gcTasks: "+Game.cpu.getUsed();
		//console.log('Harvesters: ' + harvesters.length);
		//runTower();
		//        cpuUsedRep = cpuUsedRep+"\n Used runTower: "+Game.cpu.getUsed();
		for(var room in Game.rooms){
			console.log("Running Room:"+room);
		    try{
		        var start = Game.cpu.getUsed();
		      roomMemory.cacheRoomData(Game.rooms[room]);

              //  cpuUsedRep = cpuUsedRep+"\n Used RooMCache: "+room+"start:"+start +" end: "+Game.cpu.getUsed();
		    }catch(err){
		        console.log('Error in RoomMemory on room'+room+':'+err);
		    }
            try{
                var start = Game.cpu.getUsed();
                runTower(room);
                cpuUsedRep = cpuUsedRep+"\n Cache&Tower:"+room+" T:"+getDuration(start);
            }catch(err){
                console.log('Error in RunTower on room'+room+':'+err);
            }
            
            var start = Game.cpu.getUsed();
			var creeps=Game.rooms[room].find(FIND_MY_CREEPS);
			console.log("About to cache CreepsInRoomByRole");
			//roomMemory.cacheCreepsInRoomByRole(room);
			//Game.rooms[room].memory.myCreeps = creeps;
			console.log('Current Room: '+room+ ' Containing '+creeps.length);
		    var chrono = Game.time;
			try{
			//console.log('Test:'+room);
			//console.log('My Creeps:'+JSON.stringify(creeps));
			var sw = 0;
			//console.log('My Creeps in Room: '+JSON.stringify(Game.rooms[room].memory.myCreeps));
		   
			var problemCreeps = 0;
            var successfulCreeps = 0;
                var problemCreepsDetail = "";
			chrono = getCpu();

			for(var name in creeps) {
				try{
				var creep = Game.getObjectById(creeps[name].id);
				var role = creep.memory.role;
				//console.log('Running Creep:'+creep.name+' role:'+role);
				if(creep.memory.role == 'harvester') {
					roleHarvester.run(creep);
				}else if(creep.memory.role == 'upgrader') {
					roleUpgrader.run(creep);
				}else if(creep.memory.role == 'builder'){
					roleBuilder.run(creep);
				}else if(creep.memory.role == 'remoteBuilder'){
					roleBuilder.runRemote(creep);
				}else if(creep.memory.role == 'miner'){
					roleMiner.run(creep);
				}else if(creep.memory.role == 'ferry'){
					roleFerry.run(creep);
				}else if(creep.memory.role == 'remoteMiner'){
					roleRemoteMiner.run(creep);
				}else if(creep.memory.role == 'scout'){
				    roleScout.run(creep);
				}else if(creep.memory.role == 'extractor'){
				    roleExtractor.run(creep);
				}else if(creep.memory.role == 'loader'){
				    roleLoader.run(creep);
				}else if(creep.memory.role == 'recycle'){
				    roleRecycle.run(creep);
				}else if(creep.memory.role == 'military'){
				    roleMilitary.run(creep);
				}else if(creep.memory.role == 'claimer'){
				    roleClaimer.run(creep);
				}else if(creep.memory.role == 'signer'){
					roleScout.runSigner(creep);
				}else{
				    problemCreepsDetail = problemCreepsDetail+" Mem"+creep.memory+" Roleless creep:"+JSON.stringify(creep)+"\n";
				    Game.notify(problemCreepsDetail);
				    //creep.memory.role = 'recycle';
				    console.log('RoleLess Creep found. Recycle requested');
/*					if(!creep.memory.role){
						console.log('Role Less creep found: '+creep.name);
						if(sw==0){
							creep.memory.role = 'harvester';
							sw = 1;
						}else{
							creep.memory.role = 'upgrader';
							sw = 0; 
						}
*/
				}
                successfulCreeps++;
				}catch(err){
					var errorMsg = 'Error running a role: '+creep.memory.role+' Erro: '+err+ ' on creep: '+name+ 'Room:'+ room +'Stringify:'+JSON.stringify(creep.memory);
                    problemCreepsDetail = problemCreepsDetail+errorMsg+"\n";
                    problemCreeps++;
					Game.notify(errorMsg);
					console.log(errorMsg);
				}
        	}
	        cpuUsedRep = cpuUsedRep+"\nrunCreep:SCS:"+successfulCreeps+"FLR:"+problemCreeps+" "+room+" Used: "+getDuration(chrono)+"T:"+getDuration(start);
			console.log('Creep Loop on Room:'+room+' finished: Creeps: '+creeps.length + ' ('+successfulCreeps+','+creep.length+') Problem Creeps: '+problemCreeps+'\n'+problemCreepsDetail+'\n\n');
				//controllerUpgrade(room);
				extractionManager(room);
				var curFlag= "";
			
			}catch(err){
				console.log('error in room '+room+ ' err: '+err);
			}
			 chrono = getCpu();
	        try{
				populationKeeper(room,creeps);
			}catch(err){
				console.log('Problems in population keeper: Room: '+room+' Error:'+err);
				Game.notify('Problems in population keeper: Room: '+room+' Error:'+err);
			}
			 cpuUsedRep = cpuUsedRep+"\n popKeep:"+room+" Used: "+getDuration(chrono)+"T:"+getDuration(start);
		    chrono = getCpu();
			try{
			    var roomLink = Game.rooms[room];
			    linkManager.run(roomLink);
			}catch(err){
			    console.log('Problems running link manager'+err);
			   // Game.notify('Problems running link manager',30);
			}
			
		    cpuUsedRep = cpuUsedRep+"\n linkManager:"+room+" Used: "+getDuration(chrono)+"T:"+getDuration(start);
		}
		try{
			for(var flag in Game.flags){
			//console.log('Name'+flag+ ' \n'+JSON.stringify(Game.flags[flag])+'\n'+JSON.stringify(Game.flags[flag].memory));
			    curFlag = flag;
			    roleFlag.run(Game.flags[flag]);
		    }
		}catch(orr){
		    console.log('Error running a room flag: '+curFlag+ ' '+orr);
		    
		}
	    cpuUsedRep = cpuUsedRep+"\nflags:"+room+" T:"+getDuration(start);
		});
		if(Game.time%1000==0){
		    cpuUsedRep = cpuUsedRep + " Total Time Used in Tick: "+Game.time+" "+getCpu();
		    //cpuUsedRep = 'Tick:'+Game.time+' Total:'+getCpu()+cpuUsedRep;
		    //Game.notify(cpuUsedRep,30);
		    splitReport(cpuUsedRep,1);
		}
	}
	
	function splitReport(report,interval){
	    try{
            var length = report.length;
	        if(length<500){
	            Game.notify(report,interval);
	        }else{
	             var tmpString = '';
                 var index = 0;
                 while(index<length){
                     var newVal = index+500;
                     tmpString = report.substring(index,newVal);
                     Game.notify(tmpString,interval);
                     index = newVal;
                 }
	        }
	        
	        
	    }catch(err){
	        Game.notify('Error in splitReport functoin:'+report,10);
	        
	    }
	}
	
	function getCpu(){
	    return Game.cpu.getUsed().toFixed(2);
	}
	function getDuration(start){
	    return (Game.cpu.getUsed()-start).toFixed(2);
	}
	function controllerUpgrade(room){ //???? What does this do!
		console.log('Room:'+room+' Controller: '+Game.rooms[room].controller);
		var controller = Game.rooms[room].controller;
		var roomControllers = Memory.roomControllers;
		if(!roomControllers){
			Memory.roomControllers = new Array();
			roomControllers = Memory.roomControllers;
		}
		if(!roomControllers[room]){
			Memory.roomControllers[room] = new Array();
		}
		
		
		
	}
	function gcTasks( interval){
		if(Game.time%interval!=0){
			return;
		}
		try{
		var clearedCreeps = 0;
		for(var name in Memory.creeps) {
			if(!Game.creeps[name]) {
				delete Memory.creeps[name];
				clearedCreeps++;
			}
		}
		
		if(clearedCreeps>0){
		console.log('Cleared '+clearedCreeps+' missing creeps ');
		}}catch(err){
			console.log('Error in gcTasks:'+err);
		}
	}
	function testing(creep){
		try{
			//console.log('AB:'+JSON.stringify(utility.getSourcesForRoom(creep)));
		for(var rE in Game.rooms){
		 //console.log('Re: '+JSON.stringify(Game.rooms[rE]));
		 var roomO = Game.rooms[rE];
		 var sources = roomO.find(FIND_SOURCES);
		 //console.log('srouces:'+JSON.stringify(sources));
		 var rECapacity = roomO.energyAvailable;
		 var rECapacityAvailable = roomO.energyCapacityAvailable;
		 var rStorage = roomO.find(FIND_STRUCTURES, { filter : (store) => { return store.structureType== STRUCTURE_CONTAINER || store.structureType == STRUCTURE_STORAGE }});
		 var rStore = 0;
		 rStorage.forEach((r)=>{ rStore += _.sum(r.store)});
		 //var rEStore = rE.find(FIND_STRUCTURES, { filter : (store) => { return store.structureType== STRUCTURE_CONTAINER || store.structureType == STRUCTURE_STORAGE }});
		 console.log('Room '+rE+'Overview: '+sources.length + ' sources  Capacity:'+rECapacity + ' CAvailable:'+rECapacityAvailable+' EStorage: '+rStore);
			
		}
		
			
			
		}catch(err){
			console.log('Error in testing :'+err);
		}
	}

	var defaultSpawnTimer = 5;
	function setSpawnTimer(t){
		Memory.spawnCheckTimer = t;
	}

	function getSpawnTimer(){
		return Memory.spawnCheckTimer != null ? Memory.spawnCheckTimer : defaultSpawnTimer;
	}
	
	function extractionManager(room){
	    var control = Game.rooms[room].controller;
	    if(control && control.my && control.level>=6){
	        //console.log('Room has sufficient control level');
	        var extractor = Game.rooms[room].find(FIND_STRUCTURES, {filter: (ext) => { return (ext.structureType == STRUCTURE_EXTRACTOR)}});
	        if(extractor && extractor.length){
	            Game.rooms[room].memory.extractor = extractor[0].id;
	            //console.log('Extractor set:'+Game.rooms[room].memory.extractor);
	            var mineralDeposit = Game.rooms[room].find( FIND_MINERALS);

	            if(mineralDeposit && mineralDeposit.length){
    	            //console.log('Mineral deposit:'+JSON.stringify(mineralDeposit));
    	            //console.log('Mineral Deposit:'+JSON.stringify(mineralDeposit[0]));
    	            Game.rooms[room].memory.mineralDeposit = mineralDeposit[0].id;
	            }
	        }
	    }else{
	        Game.rooms[room].memory.extractor = null;
	        Game.rooms[room].memory.mineralDeposit = null;
	    }
	}
	function needExtractors(room){
	    //console.log('Room '+room+'Needs Extractors? ');
	    if(!Game.rooms[room].memory.mineralDeposit){
	        return false;
	    }
	    //return false;
	    var mineral = Game.getObjectById( Game.rooms[room].memory.mineralDeposit) ;
	    //console.log('Need Extractors: '+ Game.rooms[room].memory.mineralDeposit +' ' +mineral);
	    if(mineral){
	        var mType = mineral.mineralType;
	        var remaining = mineral.mineralAmount;
	        //console.log('Mineral status:'+mType+' amount:'+remaining);
	        if(remaining>0){
	            return true;
	        }else{
	            //console.log('Empty Store. Returning false' );
	        }
	        
	    }return false;
	    
	}
	
	function populationKeeper(room,creeps){
		var roomRef = Game.rooms[room];
		/*if(!roomRef.controller || (roomRef.controller && !roomRef.controller.my)){
		    return;
		}*/
		try{
	    
		var spawnTimer = getSpawnTimer();
		//console.log('SpawnTimer'+spawnTimer);
	  
		//BODYPART_COST
       	var staggered = false;
		var checkingIn = Game.time%4;
		if(staggered && checkingIn!=0){
		    console.log('Will not check population this turn, too expensive. Check in:'+checkingIn+'ticks');
		    return;
		}
	    var roomSpawners = roomRef.find(FIND_MY_SPAWNS); //CAN BE OPTIMIZED
		var capacity = roomRef.energyCapacityAvailable;

		console.log('Room: '+' N:'+room+' spawners' +roomSpawners+'cap '+capacity);
	
		if(roomSpawners!=null && roomSpawners.length>0){
        		
        		var harvesters = _.filter(creeps, (creep) => creep.memory.role == 'harvester');
        		var upgraders = _.filter(creeps, (creep) => creep.memory.role == 'upgrader');
        		var builders = _.filter(creeps, (creep) => creep.memory.role == 'builder' && creep.memory.roomName == room);
        		var miners = _.filter(creeps, (creep) => creep.memory.role == 'miner');
        		//console.log('Detected Harvesters in room:'+room+': '+hv);
        		//var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        		//var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        		//var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        		//var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
        		var buildersNeeded = needBuilders(roomRef, builders);
        		var targetBuilders = buildersNeeded ? 2: 1;
        		var maxUpgraderPopulation = buildersNeeded ? 3  : 4;
        		var targetHarvesters =3;
        		var extractors = _.filter(creeps, (creep) => creep.memory.role == 'extractor');
        		var weNeedExtractors = needExtractors(room) && extractors.length < 1;
        	    if(roomRef.controller.level<3){
        	        targetHarvesters = 1;
        	        maxUpgraderPopulation = 2;
        	        targetBuilders = 3;
        	    }else if(roomRef.controller.level == 8){
        	        maxUpgraderPopulation = 2;
        	    }
        	    var r = 0;
        		console.log('Room: '+room+' NeedExtractors?'+weNeedExtractors+ ' room capacity:'+capacity+' Population: H:'+harvesters.length+ ' U:'+upgraders.length+' B:'+builders.length+ 'M:'+miners.length+' E:'+extractors.length);
    			setSpawnTimer(defaultSpawnTimer);
    			//console.log('Room Spawner!!'+roomSpawners)
    			var spawn = null;
    			for(var spawnIndex in roomSpawners){
    				console.log('RoomSp:'+roomSpawners[spawnIndex]);//+JSON.stringify(roomSpawners[spawnIndex]));
    				spawn = roomSpawners[spawnIndex] != null ? roomSpawners[spawnIndex] : Game.spawns.TheSpawn;
    				//spawningCode(spawn);
    			}
    			if(spawn.spawning){
    			    console.log('Spawner is busy for next: '+spawn.spawning.remainingTime+' ticks');
    			    return;
    			}
    			
    			 if(r = spawn.canCreateCreep([WORK,CARRY,MOVE],undefined, {})==0){
    				console.log('Can Spawn Stuff!! Harvesters');
        			if(harvesters.length < targetHarvesters || agingCreep(harvesters)) {
    			    	if(spawn.canCreateCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],undefined, {})==0){
        					var newName = spawn.createCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'harvester'});
        					console.log('Spawning new harvester: ' + newName);
        				}/*else if(spawn.canCreateCreep([CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],undefined, {})==0){
        					var newName = spawn.createCreep([CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'harvester'});
        					console.log('Spawning new harvester: ' + newName);
        				}*/else if(spawn.canCreateCreep([WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],undefined, {})==0){
        					var newName = spawn.createCreep([WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'harvester'});
        					console.log('Spawning new harvester: ' + newName);
        				}else if(spawn.canCreateCreep([WORK,CARRY,CARRY,MOVE,MOVE],undefined, {})==0){
        					var newName = spawn.createCreep([WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'harvester'});
        					console.log('Spawning new harvester: ' + newName);
        				}else{
        					var newName = spawn.createCreep([WORK,CARRY,MOVE], undefined, {role: 'harvester'});
        					console.log('Spawning new harvester: ' + newName);
        				}
        			   
        			}else if(miners.length<2  || agingCreep(miners) && capacity>500){
        				console.log('Trying to spawn miner');
        				if(capacity >= 700){
        				     var newName = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'miner'});
        				}else if(capacity >= 500){
        				     var newName = spawn.createCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'miner'});
        				}else if(capacity >= 450){
        				    var newName = spawn.createCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE], undefined, {role: 'miner'});
        				}else if(capacity<450){
    			    	    var newName = spawn.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'miner'});
        				}else{
        				    console.log('Cannot Spawn!!'+newName);
        				     var newName = spawn.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'miner'});
        				}
        				
        				
        				console.log('Spawning new miner: ' + newName);
        				
        			}else  if((upgraders.length < maxUpgraderPopulation) || (agingCreep(upgraders) && (upgraders < maxUpgraderPopulation))) {
        				console.log('MUpgPop:'+maxUpgraderPopulation);
        				if(roomRef.controller.level == 8){
    				    	if((spawn.canCreateCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'}))==0){
        						var newName = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'});
        						console.log('Spawning new upgrader: ' + newName);
        				    }else if((spawn.canCreateCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'}))==0){
        						var newName = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'});
        						console.log('Spawning new upgrader: ' + newName);
        				    }
        				}else{
        				
        				if((spawn.canCreateCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'}))==0){
        						var newName = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'});
        						console.log('Spawning new upgrader: ' + newName);
        				}else if((spawn.canCreateCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'}))==0){
        						var newName = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'});
        						console.log('Spawning new upgrader: ' + newName);
        				}else if((spawn.canCreateCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'}))==0){
        						var newName = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'});
        						console.log('Spawning new upgrader: ' + newName);
        				}else if((spawn.canCreateCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'}))==0){
        						var newName = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'});
        						console.log('Spawning new upgrader: ' + newName);
        				}else if(roomRef.controller.level<=3 && (spawn.canCreateCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'}))==0){
							var newName = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
							console.log('Spawning new upgrader: ' + newName);
						}else if(roomRef.controller.level<2 && (spawn.canCreateCreep([WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'}))==0){
        						var newName = spawn.createCreep([WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        						console.log('Spawning new upgrader: ' + newName);
        				}/*else if((spawn.canCreateCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'}))==0){
        						var newName = spawn.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        						console.log('Spawning new builder: ' + newName);
        				}*//*else if((spawn.canCreateCreep([WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'}))==0){
        						var newName = spawn.createCreep([WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        						console.log('Spawning new builder: ' + newName);
        				}else{
        				    spawn.createCreep([WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        				}
        				*/
        				/*var bigUpgraderBody = [WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
        				var smallUpgraderBody = [WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        				if(spawn.canCreateCreep(bigUpgraderBody, undefined, undefined, {role: 'upgrader'})){
        					newName = spawn.createCreep(bigUpgraderBody, undefined, undefined, {role: 'upgrader'});
        				}else{
        					newName = spawn.createCreep(smallUpgraderBody, undefined, undefined, {role: 'upgrader'});
        				}*/
        				}
        				console.log('Spawning new upgrader: ' + newName );
        			}else if(builders.length < targetBuilders || agingCreep(builders)){
        				if(buildersNeeded){
        				    // var newName = spawn.createCreep([WORK,CARRY,MOVE], undefined, {role: 'builder'});
        					    	console.log('Spawning new builder: ' + newName);
        				    
        					if(spawn.canCreateCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],undefined, {})==0){
        						var newName = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'builder', roomName: room });
        						console.log('Spawning new builder: ' + newName);
        					}/*else if(spawn.canCreateCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],undefined, {})==0){
        						var newName = spawn.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'builder'});
        						console.log('Spawning new builder: ' + newName);
        					}*/else if(spawn.canCreateCreep([WORK,CARRY,MOVE,MOVE],undefined, {})==0){
        						var newName = spawn.createCreep([WORK,CARRY,MOVE,MOVE], undefined, {role: 'builder' , roomName: room });
        						console.log('Spawning new builder: ' + newName);
        					}/*
        			        */
        				
        				}else{
        					console.log('No builders needed currently');
        				}
        			}else if(weNeedExtractors){
        			    spawn.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE],undefined, {role:'extractor'});
        			}
        			
    				
    			}else{
    				console.log('Can\'t build a creep this turn.');
    			}
		   
		  }else{
			  console.log('No Spawners in room: '+room);
			 //Game.notify('No Spawners in room: '+room);
		  }
		
		}catch(err){
			console.log('Error in population keeper: '+err);
			Game.notify('Error in population keeper: '+err);
		}
	}

	function spawningCode(spawn){
		console.log('SPAWNROOM'+spawn.room);
		var targetHarvesters = 2;
		var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
		var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
		var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
		var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
		var maxUpgraderPopulation = needBuilders(spawn.room, miners) ? 2 :  3;
		var r = 0;
	}

	function needBuilders(room, creepGroup){
		if(creepGroup.length<1)
		return true;
		var targetWallStrength = 50000;//600000;
		var targetRampartStrength = 10000;//2000000;
		var target = creepGroup[0].room.find(FIND_CONSTRUCTION_SITES);
		var buildings = room.find(FIND_STRUCTURES, { filter: (structure) => {
			return ( (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) && structure.hits<structure.hitsMax) || 
					 (structure.structureType == STRUCTURE_WALL && structure.hits < 1000) || 
					 (structure.structureType == STRUCTURE_RAMPART && structure.hits < 100000 )}});
		//console.log('Pending Construction Sites '+target.length+':'+JSON.stringify(target));
		console.log('Pending Constructions: '+target.length+' Pending Repairs:'+buildings.length );//+ ' '+JSON.stringify(buildings));
		if((target!=null && target.length>0) || (buildings!=null && buildings.length>5)){
			return true;
		}
		return false;
	}

	function agingCreep(creepGroup){
		if(creepGroup!=null){
			for(var creep in creepGroup){
				if(creep.ticksToLive<100){
					console.log('Creep :'+creep+ ' is about to die in: '+creep.ticksToLive);
					return true;
				}   
			}
		}else{
			console.log('No Valid Creep group received.');
			
		}
		return false;   
		
	}
	function runTower(room){
		
		try{

			var tower = Game.rooms[room].find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType== STRUCTURE_TOWER}});
			if(tower){
			for(var t in tower){
				t= tower[t];
				if(t.energy > 0){
				//console.log('hey:'+JSON.stringify());//Game.rooms[.name]));//[t.room]);
				var hostilesFound = utility.findHostileCreeps(t.room);
				if(hostilesFound && hostilesFound.length>0){
                    console.log('Tower Energy: '+t.energy);
                    shootHostiles(t,hostilesFound);
				}else{
				repairNetwork(t);
				healFriendlies(t);
				}
				    
				}else{
					console.log('Tower Data: '+JSON.stringify(t));
				}
			}
			}
		}catch(ex){
			console.log('Exception in runTower: '+ex);
			Game.notify('Exception in runTower: '+ex);
		}
		
		return;
		
		
	}

	function healFriendlies(tower){
		if(tower){
			var hurtFriendlies = Game.rooms[tower.room.name].find(FIND_MY_CREEPS, { filter: (creep) => { return creep.hitsMax > creep.hits/* && creep.ticksToLive > 200*/ }});
			if(hurtFriendlies && hurtFriendlies.length){
				var res = tower.heal(hurtFriendlies[0]);
				console.log('Healing damaged creeps');
				
			}
			//console.log('Friendlies: '+JSON.stringify(friendlies));
			//console.log('HurtFriendlies: '+JSON.stringify(hurtBuddy));
		}    
			
		
	}

	function shootHostiles(tower, hostiles){
		try{
		if(hostiles!=null && hostiles.length>0){
			//Game.notify('THe following bogies have been seen:'+JSON.stringify(hostiles));
			hostiles.sort( (h1,h2) => { h1.hits< h2.hits });
			var boogie = hostiles[0];
			var oHits = boogie.hits;
			var res = tower.attack(boogie);
			var nHits = boogie.hits;
			if(Game.time % 10 == 0){
                Game.notify(Game.time+' Boogies: '+hostiles.length+' . Attacking: Room:'+tower.room+' Name:'+boogie.name+'Owner:'+boogie.owner.username+'Part Toughs:'+boogie.getActiveBodyparts(TOUGH)+' Part Heals: '+boogie.getActiveBodyparts(HEAL)+
                    'Part Attack: '+boogie.getActiveBodyparts(ATTACK)+'Part Ranged:'+boogie.getActiveBodyparts(RANGED_ATTACK)+' Part work:'+boogie.getActiveBodyparts(WORK)+' AttackDamage: '+(oHits-nHits)+'Hits:'+nHits+'/'+boogie.hitsMax,10);
            }

			console.log('Attack result: '+res+' target status: '+boogie.hits +' /' +boogie.hitsMax );//+JSON.stringify(boogie));
		}else{
			//console.log('No one to attack');
		}}catch(err){
			console.log('Exception in shootHostiles'+err);
			Game.notify('Exception in shootHostiles'+err,10);
		}
	}

	function repairNetwork(tower){
		if(tower!=null){
			var targetWallStrength = 50000;// 200000;
			var targetRampartStrength = 50000;//1000000;
			//console.log('Repair Network: '+JSON.stringify(tower));
			if(tower.energy>600){            //TODO Change Parking Lot
			   var buildings = tower.room.find(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType != STRUCTURE_WALL
				   && structure.structureType != STRUCTURE_RAMPART &&    structure.hits<structure.hitsMax
			   }});
			   /*var buildings = Game.flags.ParkingLot.room.find(FIND_STRUCTURES, { filter: (structure) => { return 
				   structure.structureType != STRUCTURE_WALL 
				   && (structure.structureType != STRUCTURE_RAMPART || structure.structureType == STRUCTURE_RAMPART && structure.hits<targetRampartStrength) &&
				   //structure.hits < structure.hitsMax
			   }});*/ //TODO Centralise Repair Code and reduce redundant search ops.
			   var rampartRepairs = tower.room.find(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_RAMPART && structure.hits<10000}});
			   //console.log('RR:'+JSON.stringify(rampartRepairs));
			   var wallRepairs = null;//tower.room.find(FIND_STRUCTURES, { filter: (st) => {return st.structureType == STRUCTURE_WALL && st.hits<targetWallStrength}});
			   //console.log('B: '+JSON.stringify(buildings));
			   if(rampartRepairs!=null && rampartRepairs.length>0){
				   rampartRepairs.sort( (b1,b2)=> { b1.hits<b2.hits });
				   tower.repair(rampartRepairs[0]);
			   }else if(buildings!=null && buildings.length>0){
				   buildings.sort( (b1,b2)=> { b1.hits<b2.hits });
				   tower.repair(buildings[0]);
			   }else  if(wallRepairs!= null && wallRepairs.length>0){
				   wallRepairs.sort( (a,b)=>{ a.hits<b.hits});
				   tower.repair(wallRepairs[0]);
			   }
			}else{
				//console.log('Repairs suspended for low energy');
			}
		}
	}
	/* These functions will have to be complemented by per Room Logic
	function spawnHarvester(){
		return spawnCreep([WORK,MOVE,CARRY],null,defaultHarvesterMemory);
	}
	function spawnBuilder(){
		  return spawnCreep([WORK,MOVE,CARRY],null,defaultBuilderMemory);
	}
	function spawnUpgrader(){
		  return spawnCreep([WORK,MOVE,CARRY],null,defaultUpgraderMemory);
	}
	function spawnCreep(body,name,mem){
		return Game.spawns.TheSpawn.createCreep(body,name,mem);
	}*/