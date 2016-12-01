/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.towerControl');
 * mod.thing == 'a thing'; // true
 */

var roleTower = {
    manTowers:function(){
        var towers = new Array();
        for(var room in Game.rooms){
            var rTowers = room.find(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType== STRUCTURE_TOWER}});
            try{
            //var tower = Game.flags.ParkingLot.room.find(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType== STRUCTURE_TOWER}});
            //var hostiles = Game.flags.ParkingLot.room.find(FIND_HOSTILE_CREEPS);
            //console.log(JSON.stringify(tower));
            for(var t in rTowers){
                //console.log('Tower: '+JSON.stringify(tower[t]));
                t= tower[t];
                console.log('hey:'+JSON.stringify());//Game.rooms[.name]));//[t.room]);
                shootHostiles(t,utility.findHostileCreeps(t.room));
                repairNetwork(t);
                healFriendlies(t);
            }    
                console.log('RTowers:'+JSON.stringify(rTowers));
            }catch(ex){
            console.log('Exception: '+ex);
         }
        }
        
  
    
    return;
        
        
    },
    
    
    shootHostiles(tower, hostiles){
    if(hostiles!=null && hostiles.length>0){
        Game.notify('THe following bogies have been seen:'+JSON.stringify(hostiles));
        hostiles.sort( (h1,h2) => { h1.hits< h2.hits });
        var res = tower.attack(hostiles[0]);
        //console.log('Attack result: '+res+' target status:' +JSON.stringify(hostiles[0]));
    }else{
        //console.log('No one to attack');
    }
},

    repairNetwork:function(tower){
    if(tower!=null){
        var targetWallStrength = 30000;
        var targetRampartStrength = 470000;
        //console.log('Repair Network: '+JSON.stringify(tower));
        if(tower.energy>500){
           var buildings = Game.flags.ParkingLot.room.find(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType != STRUCTURE_WALL 
               && structure.structureType != STRUCTURE_RAMPART &&    structure.hits<structure.hitsMax
           }});
           /*var buildings = Game.flags.ParkingLot.room.find(FIND_STRUCTURES, { filter: (structure) => { return 
               structure.structureType != STRUCTURE_WALL 
               && (structure.structureType != STRUCTURE_RAMPART || structure.structureType == STRUCTURE_RAMPART && structure.hits<targetRampartStrength) &&
               //structure.hits < structure.hitsMax
           }});*/
           var rampartRepairs = tower.room.find(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_RAMPART && structure.hits<targetRampartStrength}});
           console.log('RR:'+JSON.stringify(rampartRepairs));
           //console.log('B: '+JSON.stringify(buildings));
           if(buildings!=null && buildings.length>0){
               buildings.sort( (b1,b2)=> { b1.hits<b2.hits });
               tower.repair(buildings[0]);
           }else if(rampartRepairs!=null && rampartRepairs.length>0){
               rampartRepairs.sort( (b1,b2)=> { b1.hits<b2.hits });
               tower.repair(rampartRepairs[0]);
           }
        }else{
            console.log('Repairs suspended for low energy');
        }
    }
}
};

module.exports = roleTower;