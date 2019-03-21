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

    let particlesFire = systems.ParticleSystem({
        center: { x: 300, y: 300 },
        size: { mean: 15, stdev: 5 },
        speed: { mean: 65, stdev: 35 },
        lifetime: { mean: 4, stdev: 1 }
    });
    // let particlesSmoke = systems.ParticleSystem({
    //     center: { x: 300, y: 300 },
    //     size: { mean: 12, stdev: 3 },
    //     speed: { mean: 65, stdev: 35 },
    //     lifetime: { mean: 4, stdev: 1}
    // });
    let fireRenderer = renderer.ParticleSystem(particlesFire, graphics,
        'assets/particle-effects/fire.png');
    // let smokeRenderer = renderer.ParticleSystem(particlesSmoke, graphics, 
    //     'assets/smoke-2.png');

    let gameModel = new objects.GameModel();

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
        // let hsPercent = (gameModel.player.hyperspaceStatus / gameModel.player.hyperspaceCooldown) / 100; //percent until ready
        let hsPercent = .5; //percent until ready

        console.log(hsPercent);
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
            to: { color: '#f4f442', width: 4 },
            // Set default step function for all animate calls
            step: function (state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);

                // var value = Math.round(circle.value() * 100);
                // if (value === 0) {
                //     circle.setText('');
                // } else {
                //     circle.setText(value);
                // }

            }
        });
        //   bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
        // hsBar.text.style.fontSize = '2em';

        hsBar.animate(hsPercent);  // Number from 0.0 to 1.0

        // let hyperspaceElem = document.getElementById('hyperspace-cooldown');
        // if (gameModel.player.hyperspaceStatus <= 0) {
        //     hyperspaceElem.innerHTML = '<p><strong>Hyperspace Ready</strong></p>';

        // } else {
        //     hyperspaceElem.innerHTML = '<p><strong>Hyperspace In:</strong> ' + Math.trunc(gameModel.player.hyperspaceStatus / 1000 + 1) + '</p>';//+1 is so that it doesn't say 3...2...1....0...Ready
        // }
    }

    function update(elapsedTime) {
        particlesFire.update(elapsedTime);
        // particlesSmoke.update(elapsedTime);
        // player.update(elapsedTime);

        gameModel.update(elapsedTime);
    }

    function render() {
        graphics.clear();

        // fireRenderer.render();
        // smokeRenderer.render();

        gameModel.render();
        updateHUD();
    }

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
        // myMouse.update(elapsedTime);
    }

    function gameLoop(time) {
        if (!gameModel.gameOver) {
            let elapsedTime = (time - lastTimeStamp);
            update(elapsedTime);
            processInput(elapsedTime);

            render();
            requestAnimationFrame(gameLoop);
        } else {
            gameOver();
        }
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

    requestAnimationFrame(gameLoop);
}(MyGame.systems, MyGame.render, MyGame.graphics, MyGame.objects, MyGame.input));
