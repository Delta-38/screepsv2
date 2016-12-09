/**
 * Created by paolo on 30/08/2016.
 */

module.exports = function(){

    //FLAG FUNCTIONS
    //DANGER CHECK
    /**Returns flag status*/
    Flag.prototype.isActive = function(){
      var active = this.memory.active ;
        if(active == undefined){
            this.memory.active = false;
        }
        return this.memory.active;
    };

    /**Returns the Spawn Name to Use*/
    Flag.prototype.spawn = function(){
        var spawn = this.memory.spawn;
        if(spawn == undefined){
            this.memory.spawn = null;
            spawn = this.memory.spawn;
        }
        return spawn;
    };

    Flag.prototype.getCreeps = function(){
        var creeps = this.memory.creeps;
        if(creeps == undefined){
            this.memory.creeps = [];
            creeps = this.memory.creeps;
        }
        return creeps;
    };
    Flag.prototype.setCreeps = function(creeps){
        this.memory.creeps = creeps;
    };

    Flag.prototype.needsVision = function(){
        var needsVision = this.memory.needsVision();
        if(needsVision == undefined){
            this.memory.needsVision = null;
            needsVision = null;
        }
    };

    Flag.prototype.remoteDeadCreepsFromMemoryField = function(fieldName){
        try {
            var arr = this.memory[fieldName];
            var survivingCreeps = [];
            if (arr && arr.length) {
                for(var creepIndex in arr){
                    var creepId = arr[creepIndex];
                    if(Game.getObjectById(creepId)){
                        survivingCreeps.push(creepId);
                    }else{
                        console.log(this.name+' remoteDeadCreepsFromMemoryField creep:'+creepId+" has passed away");
                    }
                }
                this.memory[fieldName] = survivingCreeps;
            } else {
                this.memory[fieldName] = [];
            }
        }catch (error){
            console.log("Error in Flag:"+this.name+" in remoteDeadCreepsFromMemoryField on fieldName:"+fieldName+" err:"+error+" "+error.trace);
            Game.notify("Error in Flag:"+this.name+" in remoteDeadCreepsFromMemoryField on fieldName:"+fieldName+" err:"+error+" "+error.trace);
        }
    };

    Flag.prototype.setCreepLogging = function(newVal){
        this.memory.creepLogging = newVal;
    };
    Flag.prototype.creepLogging = function(){
        var logging = this.memory.creepLogging;
        if(logging === undefined){
            this.memory.creepLogging = false;
        }
        return logging;
    };
    Flag.prototype.log = function(message){
        if(this.creepLogging()){
            console.log(message);
        }
    };


    //Other functions to implement






};