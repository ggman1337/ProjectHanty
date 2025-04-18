var game = {
    playfield: '#game', 
    level:null,
    currentLevel:0, 
    currentRound:0, 
    duckMax: 0, // duck has maximum id
    RoundOff: false, //true if round is finished
    liveDucks: [], // array of live ducks
    levelStats: {}, // contains information of the current level
    gun: {},
    gameTimers: null,
    ducksound: '#quak',
    gun: {
        sound1: '#gunSound1',
        sound2: '#gunSound2',
        sound3: '#gunSound3', 
        sound4: '#gunSound4', 
        bullet: 0,
        pics: null
    },
    bulletInfo: "#ammo",
    prevscore: 0, // store the score of previous level, used in case of "retry"
    score: 0,
    gameInfoPanels: {},
    init: function(){
        this.playfield = $(this.playfield); // make jquery object from selector
        this.gun.sound1 = $(this.gun.sound1);
        this.gun.sound2 = $(this.gun.sound2);
        this.gun.sound3 = $(this.gun.sound3);
        this.gun.sound4 = $(this.gun.sound4);
        this.bulletInfo = $(this.bulletInfo);
        this.ducksound = $(this.ducksound);
        this.gameInfoPanels = {
            ammo: $('#ammo'),
            rounds: $('#rounds')
        };
        
        this.playfield.on('duck:died', _.bind(function(e,duck){
            this.killDuck(duck);
            this.score += this.level.pointsPerDuck;
            $("#scoreboard").html("Score: " + this.score);
        },this));

    },
    bindInteractions: function(){
        // bind interactions used during live play
        this.playfield.on('mousedown', _.bind(function(){
            this.fireGun();
        },this));
        this.showInfo();
    },
    unbindInteractions: function(){
        // unbind interactions that should not be available during transitions and other non live play states
        this.playfield.off('mousedown');
        this.liveDucks.map(function(duck){
            duck.unbindEvents();
        });
    },
    loadLevel: function(level){
        this.clearTimers(); // wipe out current level timers
        this.unbindInteractions();
        this.hideInfo();

        this.level = level;

        $('#level').html(level.title).fadeIn();
        this.currentRound = 0; 

        // initialize level stats
        this.score = this.prevscore; // save current score to prevscore
        this.levelStats = {
            levelID: this.level.id,
            totalDucks: this.level.ducks*this.level.rounds,
            ducksKilled: 0,
            shotsFired: 0
        };
        $('#level').fadeOut();
        this.openRound();

    },
    openRound: function(){

        this.currentRound++;
        if(this.currentRound > this.level.rounds){
            this.hideInfo();
            this.LevelUp();
            return;
        }
        $("#scoreboard").html("Score: " + this.score);
        this.gameInfoPanels.rounds.html("Round "+ this.currentRound);

        this.bindInteractions();
        //------------------
        this.gun.bullet = this.level.bullets;
        this.gunUpdate();
        //------------------
        this.releaseDucks();
        this.ducksound[0].play();

        // set wave timer
        this.gameTimers = setTimeout(_.bind(function(currentRound){
            this.finishRound(this.currentRound);
        },this),(this.level.time*1000));
    },
    finishRound: function(round){
        if(this.currentRound == round && !this.RoundOff){
            clearTimeout(this.gameTimers);

            this.RoundOff = true;

            if(this.liveDucks.length > 0){
                this.flyAway();
            }
            this.ducksound[0].pause();

            // allow animations to complete before launching next round
            setTimeout(_.bind(function(){
                this.RoundOff = false;
                this.unbindInteractions();
                this.openRound();
            },this),4000);
        }
    },
    hideInfo: function(){
        var infoArr = [this.gameInfoPanels.ammo,this.gameInfoPanels.rounds];

        _.each(infoArr,function(info){
            info.fadeOut();
        });
    },
    showInfo: function(){
        var infoArr = [this.gameInfoPanels.ammo,this.gameInfoPanels.rounds];

        _.each(infoArr,function(info){
            info.fadeIn();
        });
    },
    LevelUp : function(){
        // calculate skill level to determine whether player advances
        var skills = (this.levelStats.ducksKilled/this.levelStats.totalDucks)*100;
        if(skills < 70){
            this.loser();
            return;
        }

        this.currentLevel+=1;
        this.prevscore = this.score;
        if(this.curLevel === levels.length){
            this.winner();
        }else{
            this.loadLevel(levels[this.currentLevel]);
        }
    },
    releaseDucks : function(){
        for(var i=0;i<this.level.ducks;i++){
            var duckClass = (i%2 == 0) ? 'duckA' : 'duckB';
            this.duckMax++;
            this.liveDucks.push(new Duck(this.duckMax.toString(),duckClass,this.level.speed,this.playfield).fly());
        }
    },
    killDuck: function(deadDuck){
        this.levelStats.ducksKilled+=1;

        this.liveDucks = jQuery.grep(this.liveDucks, function(a) {   
            return a.id !== deadDuck.id;
        });

        if(this.liveDucks.length === 0){
            this.finishRound(this.currentRound);
        }

    },
    
    fireGun : function(){
        this.levelStats.shotsFired+=1;
        
        if (this.gun.bullet > 0) {
            this.gun.bullet--;
            if (this.gun.bullet % 4 == 0)
                this.gun.sound1.get(0).play();
            else if (this.gun.bullet % 4 == 1)
                this.gun.sound2.get(0).play();
            else if (this.gun.bullet % 4 == 2)
                this.gun.sound3.get(0).play();
            else this.gun.sound4.get(0).play();
            this.gunUpdate();
        };
        if (this.gun.bullet == 0) this.outOfAmmo();
    },
    outOfAmmo: function(){
        this.unbindInteractions();
        this.finishRound(this.currentRound);
    },
    flyAway: function(){
        this.liveDucks.map(function(duck){
            duck.escape();
        });
        this.liveDucks = [];
    },
    winner: function(){
        this.unbindInteractions();
        $(".winner").css("display","block");
    },
    loser: function(){
        this.unbindInteractions();
        this.showInfo();
        $(".loser").css("display","block");
    },
    retry: function(){
        $('.messages').css('display','none');
        this.loadLevel(levels[this.currentLevel]);
    },
    clearTimers: function(){
        _.map(this.gameTimers,function(timer,timerName){
            clearTimeout(timer);
        });
    },
    gunUpdate: function(){
        this.gun.pics = "Ammo: ";
        for(var i=0; i<this.gun.bullet; i++){
            this.gun.pics += '<img src="images/bullet.png" align="absmiddle"/>';
        };
        this.bulletInfo.html(this.gun.pics);
    }
};