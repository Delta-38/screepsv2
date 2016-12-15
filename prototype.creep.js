/**
 * Created by paolo on 30/08/2016.
 */

module.exports = function(){

    /////////////WORKER CREEPS

    Creep.prototype.load = function(){
        var l = 0;
        for(var r in this.carry){
            l += this.carry[r] ? this.carry[r] : 0;
        }
        return l;
    };

    Creep.prototype.isFull = function(){
        return this.load()==this.carryCapacity;
    };

    Creep.prototype.hasMinerals = function(){
        var l = 0;
        for(var r in this.carry){
            var amount = this.carry[r] ? this.carry[r] : 0;
            if(amount>0 && this.carry != RESOURCE_ENERGY){
                return true;
            }
        }
        return false;
    };

    Creep.prototype.energyNear = function(){
        var r = this.pos.findInRange(FIND_DROPPED_ENERGY,1);
        if(r && r.length){
            for(var e in r){
                e = r[e];
                if(e.resourceType == RESOURCE_ENERGY){
                    return e;
                }
            }
        }return null;
    };

    Creep.prototype.linkNear = function(){
        var r = roomMemory.getLocalLinks(this.room);
        if(r && r.length){
            var near = this.pos.findInRange(r,1);
            if(near && near.length){
                return near[0];
            }else{
                return false;
            }
        }return false;
    };

    Creep.prototype.isDebugMode = function(){
        return this.memory.debug;
    };
    Creep.prototype.setDebugMode = function(debug){
        this.memory.debug = debug;
    };
    Creep.prototype.activateDebug =function(){
        this.setDebugMode(true);
    };
    Creep.prototype.deactivateDebug = function (){
        this.setDebugMode(null);
    };

    Creep.prototype.withdrawEnergyFromObject = function(ob){
        return this.withdrawFromObject(ob,RESOURCE_ENERGY);
    };

    Creep.prototype.withdrawFromObject = function(ob, resource){
        if(ob){
            if(this.pos.isNearTo(ob)){
                res = this.withdraw(ob);
            }else{
                res = this.moveTo(ob);
            }
        }else{
            Game.notify('Withdraw From object on creep receiving invalid object: '+this.name+ "pos"+this.pos+' ob:'+ob,10);

        }
    };

    Creep.prototype.harvestFromSource = function(source){
        if(source){
            var res = 0;
            var moveRes = 0;
            if(this.pos.isNearTo(source)){
                res = this.harvest(source);
            }else{
                moveRes = this.moveTo(source);
            }
            if(this.isDebugMode()){
                //TODO Start appending strings automatically and dropping when not in debug

            }


        }  else{
            Game.notify('Harvest From source on creep receiving invalid source object: '+this.name+ "pos"+this.pos,10);

        }

    };
    Creep.prototype.deposit = function(store){
        for(var resourceType in this.carry) {
            this.transfer(storage, resourceType);
        }
    };

    Creep.prototype.ecoMove = function(destination){
        this.moveTo(destination, { reusePath:25});
    };

    Creep.prototype.stdMove = function(destination){
        this.moveTo(destination, { reusePath:10});
    };

    Creep.prototype.swapWithCreep= function(otherCreep){
        otherCreep.memory.swapRequired = this.pos;
        this.moveTo(otherCreep.pos);
    };

    Creep.prototype.swapIfRequired = function(){
        var swapRequired = this.memory.swapRequired;
        if(swapRequired){
            console.log('Swap Required '+this.name+' to'+swapRequired);
            var res = this.moveTo(new RoomPosition(swapRequired.x , swapRequired.y, swapRequired.roomName));
            console.log("Received a swapRequest into " + swapRequired+ " result: "+res);
            this.memory.swapRequired = null;
            return true;
        }
        return false;
    };


    Creep.prototype.setInFlagMemory = function(flagName,fieldName){
        try {
            var flag = Game.flags[flagName];
            if (flag) {
                var arr = flag.memory[fieldName];
                if (!arr) {
                    arr = [];
                }
                if(arr.indexOf(this.id) == -1){
                    arr.push(this.id);
                }
                flag.memory[fieldName] = arr;
            } else {
                console.log("Could not set in FlagMemory. Passed flag name:" + flagName + " obtained flag:" + flag);
            }
        }catch (error){
            Game.notify("Error in Creep.setInFlagMemory "+error + "stack:"+error.trace + " passed: "+flagName+" "+fieldName);
        }
    };
    Creep.prototype.canWork = function(){
        return this.getActiveBodyparts(WORK);
    };

    Creep.prototype.canCarry = function(){
        return this.getActiveBodyparts(CLAIM);
    };
    Creep.prototype.canBuild = function(){
        return this.canCarry() && this.canWork();
    };
    Creep.prototype.canRepair = function(){
        return this.canBuild();
    };

    Creep.prototype.canMine = function(){
        return this.canWork();
    };
    Creep.prototype.canUpgrade = function(){
        return this.canBuild();
    };

    //////Military functions

    Creep.prototype.canHeal = function(){
        return this.getActiveBodyparts(HEAL);
    };
    Creep.prototype.canAttack = function(){
        return this.getActiveBodyparts(ATTACK)>0;
    };

    Creep.prototype.canBuild = function(){
        return this.getActiveBodyparts(RANGED_ATTACK)>0;
    };

    ///////////////Common CLAIM FUNCTIONS
    Creep.prototype.canClaim = function(){
        return this.getActiveBodyparts(CLAIM)>0;
    };
    Creep.prototype.canReserve = function(){
        return this.getActiveBodyparts(CLAIM)>=2;
    };
    Creep.prototype.canAttackController = function(){
        return this.getActiveBodyparts(CLAIM)>=5;
    };
    Creep.prototype.isHurt = function(){
        return (this.hitsMax != this.hits);
    }

    Creep.prototype.isSafe = function(){
        return true; //TODO FINISH ME

    };
    
    Creep.prototype.shouldFlee = function(hostiles){
        if(!hostiles || hostiles && hostiles.length==0){
            return false;
        }
        var closest = this.pos.findClosestByRange(hostiles);
        var closestRange = this.pos.getRangeTo(closest);
        console.log(this.name+'Should Flee? Range: '+closestRange+' clo'+(closestRange<10));
        return closestRange<10;
    }
    Creep.prototype.flee = function(hostiles){
        if(hostiles == null){
            hostiles = this.room.find(FIND_HOSTILE_CREEPS)
        }
        var goals = _.map(hostiles, function(source) {
            // We can't actually walk on sources-- set `range` to 1 so we path
            // next to it.
            return { pos: source.pos, range: 10, maxOps:100 };
        });
        var pathf = PathFinder.search(this.pos,goals,{ flee:true});
        var path = pathf.path;
        var res = this.moveByPath(path);
        return res;
    };

    Creep.prototype.isOld = function(){
        return this.ticksToLive <50;
    };
    Creep.prototype.parking = function(){
        //TODO Finalize Me


    };
    Creep.prototype.getRole = function(){
        return this.memory.role;
    };
    Creep.prototype.setRole= function(newRole){
        this.memory.role = newRole;
    };

    Creep.prototype.getTask = function(){
        return this.memory.task;
    };
    Creep.prototype.setTask = function(newTask){
        this.memory.task = newTask;
    };
    Creep.prototype.getWorkingRoom = function(){
        return this.memory.workingRoom;
    };
    Creep.prototype.setWorkingRoom = function(newRoom){
        this.memory.workingRoom = newRoom;
    };

    Creep.prototype.setCreepLogging = function(newVal){
        this.memory.creepLogging = newVal;
    };
    Creep.prototype.creepLogging = function(){
        var logging = this.memory.creepLogging;
        if(logging === undefined){
            this.memory.creepLogging = false;
        }
        return logging;
    };
    Creep.prototype.log = function(message){
        if(this.creepLogging()){
            console.log(message);
        }
    };

    Creep.prototype.sing = function(text){
        creep.say(text,true);
    };


}