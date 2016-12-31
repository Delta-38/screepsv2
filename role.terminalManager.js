/**
 * Created by paolo on 14/12/2016.
 */

var terminalManager = {

    roleTerminalManagerMemory:function(room){
        return {role: 'terminalManager' , roomName: room };
    },

    run:function(creep){
        var gathering = creep.memory.gathering;
        var delivering = creep.memory.delivering;

        //IF DELIVERING GO TO TERMINAL

        //IF GATHERING FIND A RESOURCE TO CARRY
            //FETCH THE RESOURCE TO CARRY
                //IF FULL DELIVER
        creep.say("TMAN");
        if(creep.load()!=0){
            creep.say('LOAD'+creep.load());
            if(creep.pos.isNearTo(creep.room.terminal)){
                for(var carry in creep.carry){
                    var res = creep.transfer(creep.room.terminal,carry);
                    creep.say('UL'+res);
                   // break;
                }
            }else{
                creep.moveTo(creep.room.terminal);
            }
        }else{
            //GATHERING
            creep.say('GTHER');
            var resource = null;
            if((resource = this.getNeededResource(creep))!=null){
                creep.say('GETRES'+resource);
                if(!creep.pos.isNearTo(creep.room.storage.pos)){
                    creep.moveTo(creep.room.storage);
                    creep.say('GTOSTO');

                }else{
                    creep.withdraw(creep.room.storage,resource);
                }
            }
        }


    },



    getNeededResource:function(creep){
        if(creep.room.storage && creep.room.terminal){
            creep.say('Ook!');
            for(var resourceKey in creep.room.storage.store){
                creep.say(resourceKey);
                creep.log("Storage Resource: "+resourceKey);
                var termRes = creep.room.terminal.store[resourceKey];
                creep.say('a'+termRes);
                var amount = RESOURCE_ENERGY == resourceKey ? 160000 : 80000;
                if(!termRes || (termRes && termRes < amount && termRes < creep.room.storage.store[resourceKey])){
                    creep.memory.fetching = resourceKey;
                    return resourceKey;
                }

            }
        }
        return null;
    }

};

module.exports = terminalManager;