/**
 * Created by paolo on 04/12/2016.
 */

var panicRoom = {

    shouldPanic:function(){

    },
    panicAvailable:function(){

    },
    interpretResult: function (room, res) {
       switch (res){
           case OK:
               //notify successful safe room activation
               Game.notify("Alert! Alert! Alert! Safe MOde activated in "+room.name+ " Go to the game quick!");
               break;
           case ERR_BUSY:
               Game.notify("Alert! Alert! Alert! Another room ("+room.name+")is under attack. Go to the game, I can't manage this on my onw!!!");
               //notify cannot activate 2 panics
               break;

           case ERR_NOT_ENOUGH_RESOURCES:
               Game.notify("Alert! Alert! Alert! No more panics available "+room.name+ " Go to the game quick!");
               //notify cannot activate more panics here
               break;

           case ERR_TIRED:
               if(Game.time%20 == 0){
                   Game.notify("Alert! Alert! Alert! Safe MOde finished in "+room.name+ " and cooldown still in effect. Go to the game quick!");
               }
                //Original panic cooldown still in progress Notify % 50
               break;

           case ERR_NOT_OWNER:
               Game.notify("Error. Attempted to activate a safe mode in room "+room.name+ " Check activation code!");
               //notify cannot activate 2 panics
               break;
           default:
               Game.notify("Unknow state for activate panic... "+res);
               break;
       }
    },

    doPanic:function(room){
        var controller = room.controller;
        if(room && controller && controller.my){
            if(!controller.safeMode){
                if(controller.safeModeAvailable > 0){
                    var res = controller.activateSafeMode();
                    this.interpretResult(res);
                }else{
                    Game.notify("Alert! Alert! Alert! No safe modes available in "+room.name+ " Go to the game quick!");
                    //Notify No safemodes available. Oh Shit!
                }
            }else{
                console.log("Safe Mode Already in Effect" +controller.safeMode);
                if(controller.safeMode && controller.safeMode % 200 == 0 ){
                    //Notify Panic Via Email
                    Game.notify("Alert! Alert! Alert! Safe MOde on in "+room.name+ "Remaining ticks" + controller.safeMode+ " Go to the game quick!");
                }
            }
        }else{
            //Can't panic in non owned room. It might be time to freak out perhaps
        }
    },
    isInvader(owner){
        return owner.username ==  "Invader";
    },

    run:function(room){
        if(room && room.controller && room.controller.my){
            var hostiles = roomMemory.getHostilesInRoom(room);
            if(hostiles && hostiles.length){
                var factions = [];
                var attackParts  = 0;
                var workParts = 0;
                var healParts = 0;
                var rangedParts = 0 , totWork= 0, totHeal = 0, totRanged =0 ,  totAttack = 0;
                for(var hostile in hostiles){
                    hostile = hostiles[hostile];
                    if(this.isInvader(hostile.owner)){
                        ///Not to worry too much
                    }else{
                        factions.push(hostile.owner.username);
                        var hoWorkParts = hostile.getActiveBodyparts(WORK);
                        var hoAttackParts = hostile.getActiveBodyparts(ATTACK);
                        var hoRangedParts = hostile.getActiveBodyparts(RANGED_ATTACK);
                        var hoHealParts = hostile.getActiveBodyparts(HEAL);
                        attackParts = hoAttackParts > attackParts ? hoAttackParts : attackParts;
                        workParts = hoWorkParts > workParts ? hoWorkParts :workParts;
                         rangedParts = hoRangedParts > rangedParts ? hoRangedParts : rangedParts;
                         healParts = hoHealParts > healParts ? hoHealParts : healParts;
                        totAttack += hoAttackParts;
                        totRanged += hoRangedParts;
                        totHeal += hoHealParts;
                        totWork += hoWorkParts;
                    }


                }
                if(factions && factions.length>0){
                    console.log("OMG Actual Human Invaders. Threat assemment in progress");
                    var dismantleThreat = false, attackThreat, rangedThreat, healThreat;
                    if(totWork >= 10 ){
                        dismantleThreat = true;
                    }
                    if(totAttack >= 10){
                        attackThreat = true
                    }
                    if(totRanged >= 10 ){
                        rangedThreat = true;
                    }
                    if(totHeal >=  10){
                        healThreat = true;
                    }
                    if(healThreat || dismantleThreat || attackThreat || rangedThreat){
                        console.log(" Might want to activate a safe mode")
                        Game.notify("Under Serious Human Attack! Proceed to activate SafeMode? ");
                    }
                }

            }else{
                //No Reason to panic
            }
        }else{
            //Not an owned room
        }
    }

}

module.exports = panicRoom;