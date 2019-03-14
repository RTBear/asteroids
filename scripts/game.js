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

    let player = new objects.PlayerShip({
        hyperspaceStatus: 5 * 1000, //float // how long until it can be used (ms)
        hyperspaceCooldown: 5 * 1000,
        accelerationRate: 0.1, //float //speed per time
        turnRate: 0.5, //float //max rotations per time
        fireRate: 0.5 * 1000, //float //max shots per time
     
        imageSrc: './assets/ships/starship.svg',   // Web server location of the image
        center: { x: 300, y: 300 },
        size: { x: 50, y: 50 },
        orientation: { x: 0, y: 1},//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
        rotation: 0,//orientation angle
        maxSpeed: 1, //float //max magnitude of momentum
        momentum: { x: 0, y: 0 },
        graphics: graphics,
    })

    function update(elapsedTime) {
        particlesFire.update(elapsedTime);
        // particlesSmoke.update(elapsedTime);
        player.update(elapsedTime);
    }

    function render() {
        graphics.clear();
        player.render();

        // fireRenderer.render();
        // smokeRenderer.render();
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
    myKeyboard.register('ArrowUp', objects.Ship.prototype.accelerate.bind(player));
    myKeyboard.register('ArrowRight', objects.Ship.prototype.turnRight.bind(player));
    myKeyboard.register('ArrowLeft', objects.Ship.prototype.turnLeft.bind(player));
    myKeyboard.register(' ', objects.PlayerShip.prototype.fire.bind(player));
    myKeyboard.register('z', objects.PlayerShip.prototype.hyperspace.bind(player));

    requestAnimationFrame(gameLoop);
}(MyGame.systems, MyGame.render, MyGame.graphics, MyGame.objects, MyGame.input));
