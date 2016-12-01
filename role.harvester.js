var utility = require('utility');
 var _ = require('lodash');
 var roleHarvester = {

     run2: function(creep){
        if(creep.isFull()){
            creep.memory.loading = true;
            this.fillUp(creep);
        }else{
            creep.memory.loading = false;
            creep.memory.destination = null;
            performDuties(creep);
        }


     },

     fillUp: function(creep){
        //Priority in Sources Link Container Dropped Storage Source
         this.fillUpWithLink(creep);
     },


     performDuties: function(creep){

     },

     fillUpWithStores:function(creep){


         
     },

     fillUpWithLink:function(creep){
        if(creep.room.controller.level<5){
            return -20;
        }else{
            var validLinks = this.getLinksWithMinimumEnergy(creep.room,creep.carryCapacity);
            if(validLinks.length>0){
                var closestLink = this.getClosestLink(creep.pos,validLinks);
                if(closestLink){
                    if(creep.pos.isNearTo(closestLink)){
                        return creep.withdrawFromObject(closestLink);
                    }else{
                        return creep.moveTo(closestLink);
                    }
                }
            }else{
                return -20;
            }
        }
     },

     getClosestLink:function(pos, links){
         return pos.findClosestByRange(links);
     },

     getLinksWithMinimumEnergy:function(room,minimumEnergy){
         var validLinks = [];
         var localLinks = roomMemory.getLocalLinks(room);
         for (var i = 0; i<localLinks ; i++){
             var link = localLinks[i];
             if(link.energy >= minimumEnergy){
                 validLinks.push(link);
             }
         }
         return validLinks;
     },
    run: function(creep) {
        
        if(creep.carry.energy == 0){
            creep.memory.loading = true;
        }else if(creep.carry.energy == creep.carryCapacity){
            creep.memory.loading = false;
            creep.memory.destination = null;
        }
        /*var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
        });*/
            
        //console.log('Targets: '+targets);
        /*var targets = creep.room.find(FIND_STRUCTURES, {filter : (structure) => { 
            return (structure.structureType == STRUCTURE_EXTENSION || 
                    structure.structureType == STRUCTURE_SPAWN || 
                    structure.structureType == STRUCTURE_CONTAINER || 
                    structure.structureType == STRUCTURE_TOWER ||
                    structure.structureType == STRUCTURE_STORAGE) && structure.energy < structure.energyCapacity}});
      */
        var load = 0;
        for(var r in creep.carry){
            load += creep.carry[r] ? creep.carry[r] : 0;
        }
             if(load < creep.carryCapacity && creep.memory.loading==true) {
	        var setDest = creep.memory.destination ? Game.getObjectById(creep.memory.destination)   : null;
	        if(setDest ){
	            if(!creep.pos.isNearTo(setDest)){
	            creep.moveTo(setDest,{reusePath:10 , maxRooms:0});
	            return;
	            }else{
	               
	            }
	        }
	        //TODO THREE ALERT LEVELS PEACE SKIRMISH WAR (NO ENEMY CREEPS AND LASTING PEACE IN ROOM) (NPC INVADERS) (PLAYER UNITS ALERT FOR 500ticks after they're gone.) //WRITE CODE TO MAN RAMPARTS
	        //console.log('Creep: '+creep.name+' loading');
            var droppedEnergy = roomMemory.getDroppedEnergy(creep.room);
//            droppedEnergy = creep.room.find(FIND_DROPPED_ENERGY);
	        var dest = null;
	        var roomStorage = null;// creep.room.find( FIND_STRUCTURES, {filter: (container) => { return container.structureType == STRUCTURE_STORAGE && container.store[RESOURCE_ENERGY]>0}});
            if(creep.room.controller.level>=5){
                links = roomMemory.getLocalLinks(creep.room);    
                closestLink = creep.pos.findClosestByPath(links);
            }
            
           // links = creep.room.controller.level >= 6 ? roomMemory.getLocalLinks(creep.room) : null;
            //links = roomMemory.getLocalLinks(creep.room);
           
            if(droppedEnergy!=null && droppedEnergy.length>0 ){//&& !utility.findHostileCreeps(creep.room)){
	            dest = creep.pos.findClosestByPath(droppedEnergy);
	            creep.say('Pickup'+(dest!=null ? dest.pos : "null dest"));
	            if(creep.pickup(dest)==ERR_NOT_IN_RANGE){
	                creep.moveTo(dest,{reusePath:10 , maxRooms:0});
	                creep.memory.destination = dest.id;
	            }
	        }else if(closestLink && creep.pos.getRangeTo(closestLink) <5 && closestLink.energy>0){
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
                }else{
                    creep.say("W:"+closestLink);
                }/*
                if(creep.withdraw(closestEnergy,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                   creep.moveTo(dest); 
                }*/
            }else{
	            //console.log('Sources:'+JSON.stringify(utility.getLocalSources(creep)));
	            var roomStorage = null;
	            //var containers = creep.room.find( FIND_STRUCTURES, {filter: (container) => { return ((container.structureType == STRUCTURE_CONTAINER) || (container.structureType == STRUCTURE_STORAGE)) && (container.store[RESOURCE_ENERGY]>0) }});
    	        var containers = utility.getLocalContainers(creep,false);
    	        containers = (containers && containers.length) ? containers : utility.getLocalContainers(creep,false);
    	        var dest = null;
    	        creep.memory.loading = true;
    	        //console.log('Containers: '+JSON.stringify(containers));
                 var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
                 var closestEnergy = utility.getNearestEnergy(creep);
                // console.log('Harvester: '+creep.name+' getnearestenergy'+utility.getNearestEnergy(creep));
                if(closestEnergy){
                    dest = closestEnergy;
                    if(dest!=null){
	                //console.log('COnt: '+dest+ ' en: '+dest.energy);
	                //console.log('Withdraw range: '+);
                    if(creep.pos.isNearTo(dest)){
                        var res = creep.withdraw(dest, RESOURCE_ENERGY);
                    }else{
                        creep.moveTo(dest,{reusePath:10 , maxRooms:0});
    	                creep.memory.destination = dest.id;
                    }
    	            
	                
    	            }else{
    	                creep.say('No C');
    	            }
                }else if(containers!=null && containers.length>0){
    	            containers = _.sortBy(containers, container => 0-container.store.energy );
//                    targets = _.sortBy( targets, target => target.energy-target.energyCapacity);
                    //console.log('CONTAINER SORT: '+JSON.stringify(containers));
                    
    	           // containers.sort((a,b)=>( a.store[RESOURCE_ENERGY]>b.store[RESOURCE_ENERGY]));
    	            //dest = containers[0];
    	            dest = creep.pos.findClosestByPath(containers);
    	            if(dest!=null){
    	                //console.log('COnt: '+dest+ ' en: '+dest.energy);
    	                //console.log('Withdraw range: '+);
                        if(creep.pos.isNearTo(dest)){
                            var res = creep.withdraw(dest, RESOURCE_ENERGY);
                        }else{
                            creep.moveTo(dest,{reusePath:10 , maxRooms:0});
        	                creep.memory.destination = dest.id;
                        }
        	            
    	                
    	            }else{
    	                creep.say('No C');
    	            }
    	        }else if((roomStorage = utility.getNonEmptyStorage(creep))&& roomStorage && roomStorage.length){
    	            dest = roomStorage[0];//creep.pos.findClosestByPath(containers);
    	            if(dest!=null){
    	                //console.log('COnt: '+dest+ ' en: '+dest.energy);
        	            if(creep.withdraw(dest, RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
        	                creep.say('Storage Pickup');
        	                creep.moveTo(dest,{reusePath:10 , maxRooms:0});
        	                creep.memory.destination = dest.id;
        	            }
    	                
    	            }else{
    	                creep.say('No S');
    	            }
    	            
    	        }else if(miners.length==0){
    	            creep.say('going to source');
//        	        var source = utility.getNearestSource(creep);
        	        var source = creep.room.find(FIND_SOURCES);
        	        source = creep.pos.findClosestByPath(source);
        	        console.log('The Source: '+source);
                    dest = source;//creep.pos.findClosestByRange(sources);
                    if(dest!=null){
                        //console.log('Source: '+dest+ ' en: '+dest.energy);
                        var near = creep.pos.isNearTo(dest);
                        if(near){
                            creep.harvest(dest);
                        }else{
                            creep.moveTo(dest,{reusePath:10 , maxRooms:0});
        	                creep.memory.destination = dest.id;
                        }
                         creep.memory.loading = true;
/*                        if(creep.harvest(dest) == ERR_NOT_IN_RANGE) {
                            moveRes = creep.moveTo(dest);
                            
                        }else{
                            creep.say('H->E');
                           
                        }
                        */
                        
                    }else{
                        creep.say('No E M');
                    }
    	        }else{
    	            creep.say('DOing myself');
	                //
	                //var sources = utility.getNonEmptyStorage(creep);
	                //var sources = creep.room.find( FIND_STRUCTURES, {filter: (container) => { return (container.structureType == STRUCTURE_STORAGE) && (container.store[RESOURCE_ENERGY]>0)}});
                    dest = creep.pos.findClosestByRange(FIND_SOURCES);
                    //dest = creep.pos.findClosestByRange(sources);
                    if(dest!=null){
                        //console.log('Source: '+dest+ ' en: '+dest.energy);
                        if(creep.harvest(dest) == ERR_NOT_IN_RANGE) {
                            moveRes = creep.moveTo(dest,{reusePath:10 , maxRooms:0});
        	                creep.memory.destination = dest.id;
                            
                        }else{
                            creep.say('H->E');
                            creep.memory.loading = true;
                        }
                    }else{
                        creep.say('No E H');
                    }
    	        }
	        }
            
	       
        }
        else{
            //this.refillStuff(creep);
            //this.getTargetStructures(creep);
            try{
               var primaryUsers = creep.room.find( FIND_STRUCTURES, {filter: (user) => { return (user.structureType == STRUCTURE_EXTENSION || user.structureType == STRUCTURE_SPAWN ) && user.energy < user.energyCapacity}});
              var secondaryUsers = null;
              var tertiaryUsers = null;
              var destination = null;
              //console.log('Primary: '+JSON.stringify(primaryUsers)+'.');
                if(primaryUsers && primaryUsers.length>0){
                    destination = creep.pos.findClosestByPath(primaryUsers);
//                    destination = primaryUsers[0];
                }
                /*
              var primaryUsers = creep.room.find( FIND_MY_STRUCTURES, {filter: (user) => { return (user.structureType == STRUCTURE_EXTENSION || user.structureType == STRUCTURE_SPAWN ) && user.energy < user.energyCapacity}});
              var secondaryUsers = creep.room.find( FIND_STRUCTURES, {filter: (user) => { return (user.structureType == STRUCTURE_TOWER) && user.energy < 300}});
              var tertiaryUsers = null;
              var destination = null;
              //console.log('Primary: '+JSON.stringify(primaryUsers)+'.');
                if(secondaryUsers != null && secondaryUsers.length>0){
                    destination = creep.pos.findClosestByRange(secondaryUsers);
                }else if(primaryUsers && primaryUsers.length>0){
                    destination = creep.pos.findClosestByPath(primaryUsers);
//                    destination = primaryUsers[0];
                }*/
                else if((secondaryUsers =creep.room.find( FIND_STRUCTURES, {filter: (user) => { return (user.structureType == STRUCTURE_TOWER) && user.energy < user.energyCapacity}}))!=null && secondaryUsers.length>0){
                    //console.log('Secondary: '+JSON.stringify(secondaryUsers)+'.');
    //                destination = secondaryUsers.sort( (a,b) => { a.energy < b.energy});
//                    destination = creep.pos.findClosestByRange(secondaryUsers);
                    destination = creep.pos.findClosestByRange(secondaryUsers);
                    creep.say('Filling tower');
//                    destination = secondaryUsers[0];
                    
                }else if(creep.room.storage){
                     destination = creep.room.storage;
                }else if((tertiaryUsers =creep.room.find( FIND_STRUCTURES, { filter: (user) => { return (user.structureType == STRUCTURE_STORAGE || user.structureType == STRUCTURE_CONTAINER) }}))!=null && tertiaryUsers.length>0){
                    //console.log('Tertiary: '+JSON.stringify(tertiaryUsers)+'.');
                    destination = tertiaryUsers[0];
                }
                //console.log('Destination:'+destination);    
                if(destination!=null){
                    var near = creep.pos.isNearTo(destination);
                    //console.log('Harvester: Range to Destination: '+creep.pos.isNearTo(destination));
                    if(near){
                        creep.transfer(destination,RESOURCE_ENERGY);
                    }else{
                        creep.moveTo(destination,{reusePath:10 , maxRooms:0});
                    }
                }else{
                    var r = Game.flags;
                    var parkingFlags = new Array();
                    for(var f in r){
                        f= r[f];
                        if(f.color == COLOR_GREEN && f.name.startsWith('Park')){
                            parkingFlags.push(f.pos);
                        }
                    }
                    //console.log('Parking QUERY RES: '+JSON.stringify(parkingFlags)+'\n\n\n\n\n\n\n');
                    if(parkingFlags && parkingFlags.length){
                    creep.say('parking');
                       //var a = creep.pos.findClosestByRange(parkingFlags);
                       //console.log('Closest Flag: '+a);
                       console.log(creep.moveTo(parkingFlags[0]));
                    }else{
                        creep.say('No Task');
                    }
                    //creep.moveTo(Game.flags.ParkingLot);
                }
            }catch(err){
                console.log('Ex'+err);
            }
	}
        
    },
    
    getTargetStructures:function(creep){
        var localStructures = roomMemory.getMyStructures(creep.room);
        var primary = [];
        var lowTowers = [];
        var secondary = [];
        var tertiary = [];
        var structure;
        for(structure of localStructures){
            console.log('Structure pos'+structure.pos);
            var t = structure.structureType;
            if( t == STRUCTURE_LINK){
                
            }else if( t == STRUCTURE_SPAWN || t == STRUCTURE_EXTENSION){
                primary.push(structure )
            }else if( t == STRUCTURE_TOWER){
                
            }
            
        }
            
            
        
    },
    
    refillStuff:function(creep){
        
        
            
            try{
                
              var localStructures = roomMemory.getMyStructures(creep.room);
                
              var primaryUsers = null; //= creep.room.find( localStructures, {filter: (user) => { return (user.structureType == STRUCTURE_EXTENSION || user.structureType == STRUCTURE_SPAWN ) && user.energy < user.energyCapacity}});
              var lowTowers = creep.room.find( localStructures, {filter: (user) => { return (user.structureType == STRUCTURE_TOWER) && user.energy < user.energyCapacity && user.energy<600}});
              
              //var primaryUsers = creep.room.find( FIND_MY_STRUCTURES, {filter: (user) => { return (user.structureType == STRUCTURE_EXTENSION || user.structureType == STRUCTURE_SPAWN ) && user.energy < user.energyCapacity}});
              var secondaryUsers = null;
              var tertiaryUsers = null;
              var destination = null;
              //console.log('Primary: '+JSON.stringify(primaryUsers)+'.');
              if(lowTowers && lowTowers.length){
                  creep.say('Towers');
                  destination = creep.pos.findClosestByRange(lowTowers);
              }else if((primaryUsers = creep.room.find( localStructures, {filter: (user) => { return (user.structureType == STRUCTURE_EXTENSION || user.structureType == STRUCTURE_SPAWN ) && user.energy < user.energyCapacity}})  )!= null && primaryUsers.length>0){
                    creep.say('Primary');
                    destination = creep.pos.findClosestByPath(primaryUsers);
//                    destination = primaryUsers[0];
                }
                else if((secondaryUsers =creep.room.find( localStructures, {filter: (user) => { return (user.structureType == STRUCTURE_TOWER) && user.energy < user.energyCapacity}}))!=null && secondaryUsers.length>0){
                    //console.log('Secondary: '+JSON.stringify(secondaryUsers)+'.');
    //                destination = secondaryUsers.sort( (a,b) => { a.energy < b.energy});
//                    destination = creep.pos.findClosestByRange(secondaryUsers);
                    destination = creep.pos.findClosestByRange(secondaryUsers);
                    creep.say('Filling tower');
//                    destination = secondaryUsers[0];
                    
                }else if(creep.room.storage){
                    creep.say('Stor'+localStructures);
                     destination = creep.room.storage;
                }else if((tertiaryUsers =creep.room.find( FIND_STRUCTURES, { filter: (user) => { return (user.structureType == STRUCTURE_STORAGE || user.structureType == STRUCTURE_CONTAINER) }}))!=null && tertiaryUsers.length>0){
                    //console.log('Tertiary: '+JSON.stringify(tertiaryUsers)+'.');
                    destination = tertiaryUsers[0];
                }
                //console.log('Destination:'+destination);    
                if(destination!=null){
                    var near = creep.pos.isNearTo(destination);
                    //console.log('Harvester: Range to Destination: '+creep.pos.isNearTo(destination));
                    if(near){
                        creep.transfer(destination,RESOURCE_ENERGY);
                    }else{
                        creep.moveTo(destination,{reusePath:10 , maxRooms:0});
                    }
                }else{
                    var r = Game.flags;
                    var parkingFlags = new Array();
                    for(var f in r){
                        f= r[f];
                        if(f.color == COLOR_GREEN && f.name.startsWith('Park')){
                            parkingFlags.push(f.pos);
                        }
                    }
                    //console.log('Parking QUERY RES: '+JSON.stringify(parkingFlags)+'\n\n\n\n\n\n\n');
                    if(parkingFlags && parkingFlags.length){
                    creep.say('parking');
                       //var a = creep.pos.findClosestByRange(parkingFlags);
                       //console.log('Closest Flag: '+a);
                       console.log(creep.moveTo(parkingFlags[0]));
                    }else{
                        creep.say('No Task');
                    }
                    //creep.moveTo(Game.flags.ParkingLot);
                }
            }catch(err){
                creep.say('RefErr:'+err);
                console.log('Ex'+err);
                Game.notify("Error in harvester refillStuff func: "+err);
            }
        
    }
    
};

module.exports = roleHarvester;