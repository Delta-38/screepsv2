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





    //Other functions to implement






};