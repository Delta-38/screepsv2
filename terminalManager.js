/**
 * Created by paolo on 02/12/2016.
 */
var terminalManager ={
        setNeededResources:function(room){
            if(room.storage && room.terminal){
                creep.say('Ook!');
                for(var resourceKey in room.storage.store){
                   // creep.say(resourceKey);
                   // creep.log("Storage Resource: "+resourceKey);
                    var termRes = creep.room.terminal.store[resourceKey];
                   // creep.say('a'+termRes);
                    if(!termRes || (termRes && termRes < 80000 && termRes < room.storage.store[resourceKey])){
                        room.memory.terminalNeedsResource = resourceKey;
                        room.memory.needsTerminalCreep = true;
                        return resourceKey;
                    }

                }
            }
            room.memory.terminalNeedsResource = null;
            room.memory.needsTerminalCreep = false;
            return null;

        },
        getNeededResource:function(room){
            return room.memory.terminalNeedsResource;
        },
        needACreep:function(room){
            return room.terminal ? room.memory.needsTerminalCreep : null;
        }


}
module.exports = terminalManager;