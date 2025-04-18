function Duck(id, classname, speed, game){

    this.id = id;
    this.className = classname;
    this.speed = 0;
    this.game = game; // game object to trigger events on and append to
    this.DOM = null;

    this.setSpeed(speed);
    this.hatch(); // add duck to DOM

    this.sounds = {
        quackHit: $('#quak')
    };

    return this;

}

Duck.prototype.bindEvents = function(){
    var _duck = this;
    this.DOM.on('mousedown',function(){
        _duck.die();
    });
};

Duck.prototype.unbindEvents = function(){
    this.DOM.off('mousedown');
};

Duck.prototype.die = function(){
    var _duck = this;
    this.unbindEvents(); // add them
    this.sounds.quackHit[0].play();
    this.game.trigger('duck:died',_duck);

    $._spritely.instances[this.id].stop_random=true;
    this.DOM.stop(true,false);

    this.DOM.addClass("deadSpin");

    this.DOM.spStop(true);
    this.DOM.spState(5);

    setTimeout(function(){
        _duck.deathSpin();
    },500);

    return this;
};

Duck.prototype.deathSpin = function(){
        this.DOM.spState(6);
        this.DOM.spStart();
        this.DOM.animate({
            top:'620'
        },800, _.bind(function(){
            //this.sounds.thud[0].play();
            delete $._spritely.instances[this.id];
            this.DOM.attr("class","deadDuck");
            //this.game.trigger('duck:down'); // HA GET IT, DUCK DOWN!?!
        },this));
};

Duck.prototype.hatch = function(){

    $('<div id="'+this.id+'" class="duck '+this.className+'"></div>').appendTo(this.game);
    this.DOM = $("#"+this.id);
    this.bindEvents();
};

Duck.prototype.fly = function(){
    var _this = this;
    this.DOM.sprite({fps: 6, no_of_frames: 3,start_at_frame: 1});
    this.DOM.spRandom({
        top: 600,
        left: 700,
        right: 0,
        bottom: 0,
        speed: _this.speed,
        pause: 0
    });

    return this;
};

Duck.prototype.escape = function(){
    this.unbindEvents();
    if(!this.DOM.hasClass("deadSpin")){
        //this.game.trigger("duck:miss");
        this.game.animate({
            backgroundColor: '#fbb4d4'
        },900);
        $._spritely.instances[this.id].stop_random=true;
        this.DOM.spState(2);
        this.DOM.animate({
            top:'-200',
            left:'460'
        },500, function(){
            delete $._spritely.instances[this.id];
            $(this).attr("class","deadDuck");
        });
    }

    return this;
};

Duck.prototype.setSpeed = function(duckSpeed){
    this.speed = 3000 - duckSpeed * 250;
};