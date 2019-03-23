//------------------------------------------------------------------
//
// This provides the "game" code.
//
//------------------------------------------------------------------
MyGame.main = (function (systems, graphics, objects, input) {
    'use strict';

    console.log('game initializing...');

    let lastTimeStamp = performance.now();

    let gameKeyboard = input.Keyboard();
    let menuKeyboard = input.Keyboard();

    let audioSystem = systems.AudioSystem();
    audioSystem.initialize();

    let particleSystem = systems.ParticleSystem();

    let gameModel = new objects.GameModel(particleSystem, audioSystem);

    let menu = systems.Menu();


    let highScores = JSON.parse(localStorage.getItem('highscores')) || [];
    handleHighScores(null);

    let handledGameOver = false;

    function gameOver() {
        if (!handledGameOver) {
            handledGameOver = true;
            document.querySelector('#menu #gameover .score').innerHTML = '' + gameModel.score;
            menu.showGameOver();
            handleHighScores(gameModel.score);
        }
    }

    function handleHighScores(newScore) {
        if (newScore != null) {
            let maxHighScoreCount = 5;
            highScores.push(newScore);
            highScores.sort((a, b) => b - a);//descending numeric sort (the default sort is alphabetical)
            if (highScores.length > maxHighScoreCount) {
                highScores.splice(maxHighScoreCount);//remove extra entries
            }

        }

        let highscoresDiv = document.querySelector('#highscores-output');
        while (highscoresDiv.firstChild) {
            highscoresDiv.removeChild(highscoresDiv.firstChild);
        }
        for (let score of highScores) {
            let s = document.createElement('li');
            s.appendChild(document.createTextNode('' + score));
            document.querySelector('#highscores-output').appendChild(s);
        }

        localStorage['highscores'] = JSON.stringify(highScores);//persist

        //update high score on HUD
        let highscoreDiv = document.querySelector('#hud #highscore-display');
        while (highscoreDiv.firstChild) {
            highscoreDiv.removeChild(highscoreDiv.firstChild);
        }
        document.querySelector('#hud #highscore-display').appendChild(document.createTextNode('' + (highScores[0] || '0' )))
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
        gameModel.update(elapsedTime);
        particleSystem.update(elapsedTime);
    }

    function render() {
        graphics.clear();

        particleSystem.render();
        gameModel.render();
        updateHUD();
    }

    function processGameInput(elapsedTime) {
        gameKeyboard.update(elapsedTime);
        // myMouse.update(elapsedTime);
    }

    function processMenuInput(elapsedTime) {
        menuKeyboard.update(elapsedTime);
        // myMouse.update(elapsedTime);
    }

    function gameLoop(time) {
        var elapsedTime = (time - lastTimeStamp);
        menu.showMenu();
        processMenuInput(elapsedTime);
        if (menu.currentState.name != 'pause') {
            update(elapsedTime);

            if (!gameModel.gameOver && menu.currentState.name == 'play') {
                processGameInput(elapsedTime);
                handledGameOver = false;
            } else if (gameModel.gameOver) {
                gameOver();
            }

            render();
        }
        requestAnimationFrame(gameLoop);
        lastTimeStamp = time;
    };

    menuKeyboard.register('ArrowUp', menu.menuUp, false);
    menuKeyboard.register('ArrowRight', menu.menuRight, false);
    menuKeyboard.register('ArrowDown', menu.menuDown, false);
    menuKeyboard.register('ArrowLeft', menu.menuLeft, false);
    menuKeyboard.register('Escape', menu.menuEsc, false);
    menuKeyboard.register('Enter', menu.menuEnter, false);

    //register game inputs
    gameKeyboard.register('ArrowUp', objects.Ship.prototype.accelerate.bind(gameModel.player));
    gameKeyboard.register('ArrowRight', objects.Ship.prototype.turnRight.bind(gameModel.player));
    gameKeyboard.register('ArrowLeft', objects.Ship.prototype.turnLeft.bind(gameModel.player));


    ///WARNING: very gross way of doing audio for thrust of player ship... not sure how to do this with the audio system though
    document.onkeydown = checkStartThrust;
    function checkStartThrust(e) {
        if (!gameModel.gameOver && menu.currentState.name == 'play') {
            e = e || window.event;
            if (e.keyCode == '38' || e.keyCode == '87') {//38 is up arrow and 87 is 'w' key
                MyGame.sounds.thrust.play();
            }
        }
    }
    document.onkeyup = checkEndThrust;
    function checkEndThrust(e) {
        e = e || window.event;
        if (e.keyCode == '38' || e.keyCode == '87') {//38 is up arrow and 87 is 'w' key
            MyGame.sounds.thrust.pause();
        }
    }


    gameKeyboard.register('w', objects.Ship.prototype.accelerate.bind(gameModel.player));
    gameKeyboard.register('d', objects.Ship.prototype.turnRight.bind(gameModel.player));
    gameKeyboard.register('a', objects.Ship.prototype.turnLeft.bind(gameModel.player));

    gameKeyboard.register(' ', objects.PlayerShip.prototype.fire.bind(gameModel.player));
    gameKeyboard.register('z', objects.PlayerShip.prototype.hyperspace.bind(gameModel.player));

    window.addEventListener('resize', evt => {
        GAME_SIZE_X = window.innerWidth;
        GAME_SIZE_Y = window.innerHeight;
        document.querySelector('#game-canvas').setAttribute('width', GAME_SIZE_X);
        document.querySelector('#game-canvas').setAttribute('height', GAME_SIZE_Y);
        gameModel.calculateSpawnPoints();
    });

    document.querySelectorAll('.newgame-btn').forEach((el) => {
        el.addEventListener('click', () => {
            menu.addStateByName('play');
            gameModel.newGame();
        });
    });

    document.querySelectorAll('.mainmenu-btn').forEach((el) => {
        el.addEventListener('click', () => {
            menu.goToMainMenu();
            gameModel.clearGame();
        });
    });

    document.querySelector('#highscores-btn').addEventListener('click', () => { menu.addStateByName('highscores'); });
    document.querySelector('#help-btn').addEventListener('click', () => { menu.addStateByName('help'); });
    document.querySelector('#credits-btn').addEventListener('click', () => { menu.addStateByName('credits'); });


    requestAnimationFrame(gameLoop);
}(MyGame.systems, MyGame.graphics, MyGame.objects, MyGame.input));
