// Creates a new AudioSystem object 

MyGame.systems.AudioSystem = function () {
    // let effects = [];//array containing current particle effects

    function initialize() {
        'use strict';
    
        function loadSound(source) {
            let sound = new Audio();
            sound.src = source;
            return sound;
        }
    
        function loadAudio() {
            MyGame.sounds = {}

            MyGame.sounds.laser = loadSound('assets/sounds/laser.wav');
            MyGame.sounds.missle = loadSound('assets/sounds/missle.wav');
            MyGame.sounds.boomMissle = loadSound('assets/sounds/boom2.wav');
            MyGame.sounds.boomLaser = loadSound('assets/sounds/distant-explosion-pd.wav');
            MyGame.sounds.boomAsteroid = loadSound('assets/sounds/boom3.wav');
            MyGame.sounds.boomUFO = loadSound('assets/sounds/boom4.wav');
            MyGame.sounds.warp = loadSound('assets/sounds/boom7.wav');
            MyGame.sounds.boomPlayer = loadSound('assets/sounds/boom9.wav');
            MyGame.sounds.background = loadSound('assets/sounds/space-atmosphere.mp3');
            MyGame.sounds.thrust = loadSound('assets/sounds/thrust-pd.mp3');
        }
    
        console.log('audio initializing...');
    
        loadAudio();
    }

    function playSound(whichSound) {
        var audio = document.createElement("audio");
        audio.src = MyGame.sounds[whichSound].src;
        // audio.addEventListener("ended", function () {
        //     document.removeChild(audio);
        // }, false);
        audio.play(); 
    }

    let api = {
        initialize: initialize,
        playSound: playSound,
        // get effects() { return effects; }
    };

    return api;
};
