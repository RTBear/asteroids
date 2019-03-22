//------------------------------------------------------------------
//
// This provides the "game" code.
//
//------------------------------------------------------------------
MyGame.main = (function (systems, renderer, graphics, objects, input) {
    'use strict';

    console.log('game initializing...');

    let lastTimeStamp = performance.now();

    let myKeyboard = input.Keyboard();

    let particleSystem = systems.ParticleSystem();

    let gameModel = new objects.GameModel(particleSystem);

    function gameOver() {
        console.log("GAME OVER");
    }

    function updateHUD() {
        //update score
        let scoreElem = document.getElementById('current-score');
        scoreElem.innerHTML = '<p><strong>Score:</strong> ' + gameModel.score + '</p>';
        //update level
        let currLvlElem = document.getElementById('current-level');
        currLvlElem.innerHTML = '<p><strong>Level:</strong> ' + gameModel.level + '</p>';
        //update lives remaining
        let livesElem = document.getElementById('lives-remaining');
        livesElem.innerHTML = '<p><strong>Lives Remaining:</strong> ' + gameModel.remainingLives + '</p>';
        //update hyperspace cooldown
        document.getElementById('hyperspace-cooldown').innerHTML = '';
        let hsPercent = 1 - (gameModel.player.hyperspaceStatus / gameModel.player.hyperspaceCooldown); //percent until ready

        //draw hyperspace status bar
        if (hsPercent < 1) {
            var hsBar = new ProgressBar.Circle('#hyperspace-cooldown', {
                color: '#aaa',
                // This has to be the same size as the maximum width to
                // prevent clipping
                strokeWidth: 4,
                trailWidth: 1,
                easing: 'linear',
                duration: 0.0001,
                text: {
                    autoStyleContainer: true
                },
                from: { color: '#f4f442', width: 4 },
                to: { color: '#cece29', width: 4 },
                // Set default step function for all animate calls
                step: function (state, circle) {
                    circle.path.setAttribute('stroke', state.color);
                    circle.path.setAttribute('stroke-width', state.width);
                }
            });
        } else {
            var hsBar = new ProgressBar.Circle('#hyperspace-cooldown', {
                color: '#aaa',
                // This has to be the same size as the maximum width to
                // prevent clipping
                strokeWidth: 4,
                trailWidth: 1,
                easing: 'linear',
                duration: 0.0001,
                text: {
                    autoStyleContainer: true
                },
                from: { color: '#ffff42', width: 4 },
                to: { color: '#ffff42', width: 4 },
                // Set default step function for all animate calls
                step: function (state, circle) {
                    circle.path.setAttribute('stroke', state.color);
                    circle.path.setAttribute('stroke-width', state.width);
                }
            });
        }
        hsBar.animate(hsPercent);  // Number from 0.0 to 1.0

    }

    function update(elapsedTime) {
        // particlesFire.update(elapsedTime);
        // particlesSmoke.update(elapsedTime);
        // player.update(elapsedTime);

        gameModel.update(elapsedTime);
        particleSystem.update(elapsedTime);
    }

    function render() {
        graphics.clear();

        particleSystem.render();
        gameModel.render();
        updateHUD();
    }

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
        // myMouse.update(elapsedTime);
    }

    function gameLoop(time) {
        var elapsedTime = (time - lastTimeStamp);
        update(elapsedTime);

        if (!gameModel.gameOver) {
            processInput(elapsedTime);
        } else {
            gameOver();
        }

        render();
        requestAnimationFrame(gameLoop);
        lastTimeStamp = time;
    };

    //register inputs
    myKeyboard.register('ArrowUp', objects.Ship.prototype.accelerate.bind(gameModel.player));
    myKeyboard.register('ArrowRight', objects.Ship.prototype.turnRight.bind(gameModel.player));
    myKeyboard.register('ArrowLeft', objects.Ship.prototype.turnLeft.bind(gameModel.player));

    myKeyboard.register('w', objects.Ship.prototype.accelerate.bind(gameModel.player));
    myKeyboard.register('d', objects.Ship.prototype.turnRight.bind(gameModel.player));
    myKeyboard.register('a', objects.Ship.prototype.turnLeft.bind(gameModel.player));

    myKeyboard.register(' ', objects.PlayerShip.prototype.fire.bind(gameModel.player));
    myKeyboard.register('z', objects.PlayerShip.prototype.hyperspace.bind(gameModel.player));

    window.addEventListener('resize', evt => {
        GAME_SIZE_X = window.innerWidth;
        GAME_SIZE_Y = window.innerHeight;
        document.querySelector('#game-canvas').setAttribute('width', GAME_SIZE_X);
        document.querySelector('#game-canvas').setAttribute('height', GAME_SIZE_Y);
        gameModel.calculateSpawnPoints();
    });

    requestAnimationFrame(gameLoop);
}(MyGame.systems, MyGame.render, MyGame.graphics, MyGame.objects, MyGame.input));
