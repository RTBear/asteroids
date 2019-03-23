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
        }
    
        console.log('audio initializing...');
    
        loadAudio();
    }

    function playSound(whichSound) {
        var audio = document.createElement("audio");
        audio.src = MyGame.sounds[whichSound].src;
        audio.addEventListener("ended", function () {
            document.removeChild(this);
        }, false);
        audio.play(); 
    }

    function laser(){
        playSound('laser');
    }

    function missle(){
        playSound('missle');
    }

    let api = {
        initialize: initialize,
        playSound: playSound,
        laser: laser,
        missle: missle,
        // get effects() { return effects; }
    };

    return api;
};
