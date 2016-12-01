var linkManager = {

    run:function(room){
        var links = roomMemory.getLocalLinks(room);
        //console.log('Links in Room: '+room+' '+JSON.stringify(links));
        if(links && links.length){
            //console.log('Links found');

            this.basicInit(room,links);
            //console.log('Basic Init has run');
            if(links.length<2){
                return ;
            }else{
                this.manageLinks(room,links);
            }

        }

    },

    getEmptiestReceiverLink: function (links, linksSettings) {
        var lowest = null;
        for(var link in links){
            link = links[link];
    
            var linkSettings = linksSettings[link.id];
            if(linkSettings["receiver"] && link.energy<link.energyCapacity){
                if(!lowest){
                   lowest = link;
                }else{
                    lowest = link.energy < lowest.energy ? link : lowest;
                }
                //Add something about the link being full
                //return link;
            }
        }return lowest;
    },

    
    getReceiverLink: function (links, linksSettings) {
        
        for(var link in links){
            link = links[link];
            var linkSettings = linksSettings[link.id];
            if(linkSettings["receiver"] && link.energy<link.energyCapacity){
                //Add something about the link being full
                return link;
            }
        }return null;
    },

    runLink: function (link,links,linksSettings) { //Implement Priority once the system works
        if(link){
            if(link.cooldown>0){
                return; //LINK on COOLDOWN
            }
            if(link.energy == 0){
                return; //LINK EMPTY
            }
            //var receiver = this.getReceiverLink(links,linksSettings);
            var receiver = this.getEmptiestReceiverLink(links,linksSettings);
           
            if(receiver){
                var res = link.transferEnergy(receiver);
            }else{
                console.log("Link didn't find any targets this turn");
            }

        }else{
            console.log("Invalid link passed into runLink"+link);
            Game.notify("Invalid link passed into runLink: "+link,30);
        }
    },

    manageLinks: function (room, links) {
        //return false;
        var linksSettings = room.memory.links;
        for(var link in links){
        	var link = links[link];
        	var linkSettings = linksSettings[link.id];
        	if(link && linkSettings && linkSettings["isActive"] && !linkSettings["receiver"]){
        		if(linkSettings){
        			this.runLink(link,links,linksSettings);
        		}
        
        	}
        
        }
    },

    basicInit: function (room,links) {
        if(room.memory.resetLinks){
            room.memory.links = null;
            room.memory.resetLinks = null;
        }
        
        if(!room.memory.links){
            room.memory.links = {};
        }
        for(var link in links){
            var link = links[link];
            var linkId = link.id;
            //console.log("Link:"+link +' ID'+ linkId);
            if(!room.memory.links[linkId]){
                var props = {};
                props["isActive"] = false;
                props["receiver"] = false;
                props["priority"] = 0;
                props["pos"] = link.pos;
                room.memory.links[linkId] = props;
                //console.log('Setting Link: '+linkId+' With: "'+JSON.stringify(props)+'" SetVal:'+JSON.stringify(room.memory.links[linkId]));
            }
            //console.log("Link:"+link+" end");
        }
        //console.log("Total Link For Room: "+room.name+"\n"+JSON.stringify(room.memory.links));
        return true;
    },


    getRoomLinks:function(room){
        var roomLinks = room.memory.getLocalLinks();

        if(roomLinks.length == 0){
            return;
        }
        //Get Cached Links or build cache looking for flags
    },

    /*
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

     */
}

module.exports = linkManager;