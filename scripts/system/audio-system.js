// Creates a new AudioSystem object 

MyGame.systems.AudioSystem = function () {
    // let effects = [];//array containing current particle effects

    function initialize() {
        'use strict';
    
        function loadSound(source) {
            let sound = new Audio();
            // sound.addEventListener('canplay', function() {
            //     console.log(`${source} is ready to play`);
            // });
            // sound.addEventListener('play', function() {
            //     console.log(`${source} started playing`);
            // });
            // sound.addEventListener('pause', function() {
            //     console.log(`${source} paused`);
            // });
            // sound.addEventListener('canplaythrough', function() {
            //     console.log(`${source} can play through`);
            // });
            // sound.addEventListener('progress', function() {
            //     console.log(`${source} progress in loading`);
            // });
            // sound.addEventListener('timeupdate', function() {
            //     console.log(`${source} time update: ${this.currentTime}`);
            // });
            sound.src = source;
            return sound;
        }
    
        function loadAudio() {
            MyGame.sounds = {}

            MyGame.sounds.laser = loadSound('assets/sounds/laser.wav');

            // // Reference: https://freesound.org/data/previews/156/156031_2703579-lq.mp3
            // MyGame.sounds['audio/sound-1'] = loadSound('audio/sound-1.mp3', 'Sound 1', 'id-play1');
            // // Reference: https://freesound.org//data/previews/109/109662_945474-lq.mp3
            // MyGame.sounds['audio/sound-2'] = loadSound('audio/sound-2.mp3', 'Sound 2', 'id-play2');
            // // Reference: https://www.bensound.com/royalty-free-music/track/extreme-action
            // MyGame.sounds['audio/bensound-extremeaction'] = loadSound('audio/bensound-extremeaction.mp3', 'Music', 'id-play3');
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

    let api = {
        initialize: initialize,
        playSound: playSound,
        laser: laser,
        // get effects() { return effects; }
    };

    return api;
};
