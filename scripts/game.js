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
    }

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
        // myMouse.update(elapsedTime);
    }

    function gameLoop(time) {
        let elapsedTime = (time - lastTimeStamp);

        update(elapsedTime);
        processInput(elapsedTime);
        lastTimeStamp = time;
        
        render();

        requestAnimationFrame(gameLoop);
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
