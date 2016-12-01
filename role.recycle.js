
var roleRecycle = {

    run:function(creep){

        //FIND NEAREST SPAWNER OR CHECK MEMORY
        var recyclingPoint = creep.memory.recyclingPoint;
        if(!recyclingPoint){
            var closestSpawn = this.closestSpawn(creep.pos);
            if(closestSpawn){
                creep.memory.recyclingPoint = closestSpawn.id;
                recyclingPoint = closestSpawn;
            }else {
                var s = Game.spawns.Spawn;
                if (s) {
                    recyclingPoint = s;
                    creep.memory.recyclingPoint = s.id;
                } else {

                }
            }
        }else{
            recyclingPoint = Game.getObjectById(recyclingPoint);
        }

        if(creep.pos.isNearTo(recyclingPoint)){
            recyclingPoint.recycleCreep(creep);
        }else{
            creep.moveTo(recyclingPoint, { reusePath: 50});
        }

    },

    closestSpawn:function(position){
        return position.findClosestByRange(Game.spawns);
    }

}

module.exports = roleRecycle;