/**
 * Created by paolo on 30/08/2016.
 */

module.exports = function () {

    Spawn.prototype.makeUpgraderBody = function (capacity, roadOnly) {
        var body = new Array();
        body.push(WORK);
        body.push(MOVE);
        body.push(CARRY);
        var cost = 200;
        var carry = 0;
        var move = 0;
        var work = 0;
        if (roadOnly) {
            while (cost < capacity) {
                if (carry < 3 && cost + 200 <= capacity) {
                    body.push(CARRY);
                    body.push(MOVE);
                    body.push(WORK);
                    work++;
                    carry++;
                    move++;
                    cost += 200;
                } else {
                    if (cost + 150 <= capacity) {
                        body.push(MOVE);
                        body.push(WORK);
                        move++;
                        work++;
                        cost += 150;
                    } else {
                        break;
                    }
                }
            }
        } else {
            while (cost < capacity) {
                if (carry < 3) {
                    body.push(CARRY);
                    body.push(MOVE);
                    body.push(MOVE);
                    body.push(WORK);
                    work++;
                    carry++;
                    move += 2;
                    cost += 250;
                } else {
                    if (cost + 150 <= capacity) {
                        body.push(MOVE);
                        body.push(WORK);
                        move++;
                        work++;
                        cost += 150;
                    } else {
                        break;
                    }
                }
            }
        }
        return body;
    };

    Spawn.prototype.makeMinerBody = function (capacity, emergency) {
        var body = new Array();
        body.push(WORK);
        body.push(MOVE);
        body.push(CARRY);
        var cost = 200;
        var carry = 0;
        var move = 0;
        var work = 0;
        if (roadOnly) {
            while (cost < capacity) {
                if (cost + 150 <= capacity) {
                    body.push(MOVE);
                    body.push(WORK);
                    move++;
                    work++;
                    cost += 150;
                } else {
                    break;
                }
            }
        } else {
            while (cost < capacity) {
                if (cost + 150 <= capacity) {
                    body.push(MOVE);
                    body.push(WORK);
                    move++;
                    work++;
                    cost += 150;
                } else {
                    break;
                }
            }
        }

        return body;
    };

    Spawn.prototype.makeBuilderBody = function (capacity,roadOnly) {
        var body = new Array();
        body.push(WORK);
        body.push(MOVE);
        body.push(CARRY);
        var cost = 200;
        var carry = 0;
        var move = 0;
        var work = 0;
        if (roadOnly) {
            while (cost < capacity) {
                if (carry < 3 && cost + 200 <= capacity) {
                    body.push(CARRY);
                    body.push(MOVE);
                    body.push(WORK);
                    work++;
                    carry++;
                    move++;
                    cost += 200;
                } else {
                    if (cost + 150 <= capacity) {
                        body.push(MOVE);
                        body.push(WORK);
                        move++;
                        work++;
                        cost += 150;
                    } else {
                        break;
                    }
                }
            }
        } else {
            while (cost < capacity) {
                if (carry < 3) {
                    body.push(CARRY);
                    body.push(MOVE);
                    body.push(MOVE);
                    body.push(WORK);
                    work++;
                    carry++;
                    move += 2;
                    cost += 250;
                } else {
                    if (cost + 150 <= capacity) {
                        body.push(MOVE);
                        body.push(WORK);
                        move++;
                        work++;
                        cost += 150;
                    } else {
                        break;
                    }
                }
            }
        }
        return body;
    };

    Spawn.prototype.spawnUpgrader = function () {
        return this.spawnBestUpgrader( {role: 'upgrader'}, true);
    };

    Spawn.prototype.spawnBestUpgrader = function (mem, roadOnly) { //A var for road types ?
        /*if(!this.isFull()) {
         return ERR_NOT_ENOUGH_ENERGY;
         }*/
        var body = this.makeUpgraderBody(this.peakCapacity(), roadOnly);
        return this.createCreep(body, undefined, mem);
    };

    Spawn.prototype.spawnSmallUpgrader = function (mem, roadOnly) {
        if (!this.isFull())
            return ERR_NOT_ENOUGH_ENERGY;
        var body = this.makeUpgraderBody(200, roadOnly);
        return Spawn.createCreep(body, undefined, mem);
    };

    Spawn.prototype.spawnBuilder = function (mem) {
        this.makeBuilderBody(capacity);
        //Ratio 1 Work 1Carry 1Move
    };

    Spawn.prototype.spawnHarvester = function (mem) {
        //ration 1Work N Carry NMove
    };
    Spawn.prototype.spawnMiner = function (mem, emergency) {
        var capacity = this.currentCapacity();
        if (emergency) {
            var body = this.makeMinerBody(capacity, emergency);
        }
        //ration 6Work 1 Carry 4Move
    };
    Spawn.prototype.spawnExtractor = function (mem) {
        //ratio 2Work 2Carry 2Move;
    };

    Spawn.prototype.spawnUpgrader = function (mem) {
        //ration 2
        this.createCreep([MOVE, WORK, CARRY], undefined, mem);
    };

    Spawn.prototype.isFull = function () {
        return this.peakCapacity() == this.currentCapacity();
    };

    Spawn.prototype.peakCapacity = function () {
        //console.log("R EA:"+this.room.energyAvailable+" ECA:"+this.room.energyCapacityAvailable);
        return this.room.energyCapacityAvailable;
    };
    Spawn.prototype.currentCapacity = function () {
        return this.room.energyAvailable;
    };
};