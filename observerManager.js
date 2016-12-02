/**
 * Created by paolo on 02/12/2016.
 */
var observerManager = {

    memoryKey:function(){
      return "observers";
    },

    init:function (){
        Memory[this.memoryKey()] = null;

    },

    getObservers:function(){
        var mem = Memory[this.getObservers()];
        if(mem === undefined || mem == null){
            mem = this.fetchObservers();
        }return mem;
    },

    fetchObservers:function(){
        var observers = {};
        for(var room in Game.rooms){
            room = Game.rooms[room];
            if(room){
                var search = room.find(STRUCTURE_OBSERVER);
                if(search && search.length){
                    for(var observer in search){
                        observer = search[observer];
                        observers.push(observer);
                    }
                }
            }
        }
        return observers;
    }

}

module.exports =  observerManager;