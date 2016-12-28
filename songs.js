/**
 * Created by paolo on 11/12/2016.
 */
var songs = {

        singInRoom: function (room) {


        },

        saveSongToMemory:function(songName, text){
            //text = text.replace("\r\n","-");
            this.checkMemory();
            console.log('Saving Song: '+songName+" Text: "+text);
            Memory.songs[songName] = text;
            console.log('Saved Song: '+Memory.songs[songName]);
        },

        checkMemory:function(){
            if(!Memory.songs){
                console.log('Creating Song Object');
                Memory.songs = {};
            }
        },
        deleteSongFromMemory:function(songName){
            this.checkMemory();
            delete Memory.songs.songName;
        },

        getSong:function(songName){
           this.checkMemory();
            var song = Memory.songs[songName];
           //console.log('Song'+song);
            return song;
        },

        countSongLines: function(songName){
            var song = this.getSong(songName);
            var c = null;
            if(song){
               // console.log("Song Match: "+song.match(/-/g));
                c = (song.match(/-/g) || []).length;
                console.log("Mini c:"+c);
            }
            console.log("C: "+c);
            return c;
        },

        getLine:function(songName, line){
            var song = this.getSong(songName);
            var l = "Not Found";
            if(song){
                var cur = 0;
                var lineStart = 0;
                console.log("Line Requested: "+line);
                while(cur<line){
                    lineStart = song.indexOf("-",lineStart+1);
                    cur++;
                }

                var endLine = song.indexOf("-",lineStart+1);
                console.log('Found Indexes: '+lineStart+" "+endLine);
                if(endLine != -1){
                    l = song.substring(lineStart+1,endLine);

                }else{
                    l = song.substring(lineStart+1);
                }
            }else{
                l = "Not Found";
            }
            return l;
        }
};


module.exports = songs;