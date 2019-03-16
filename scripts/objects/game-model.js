// --------------------------------------------------------------
//
// Creates a GameModel object, with functions for managing state.
//
// --------------------------------------------------------------
MyGame.objects.GameModel = function () {
    'use strict';

    this.entities = [];//array of SpaceStates //TODO
    this.player = new MyGame.objects.PlayerShip({
        hyperspaceStatus: 5 * 1000, //float // how long until it can be used (ms)
        hyperspaceCooldown: 5 * 1000,
        accelerationRate: 0.1, //float //speed per time
        turnRate: 0.5, //float //max rotations per time
        fireRate: 0.3 * 1000, //float //max shots per time ///////// RECOMMENDED FOR PRODUCTION
        // fireRate: 0.05 * 1000, //float //max shots per time ///////// JUST FOR FUN
        projectileSpeed: 10,
        projectileAccelerationRate: 1000,

        imageSrc: './assets/ships/starship.svg',   // Web server location of the image
        center: { x: 300, y: 300 },
        size: { x: 50, y: 50 },
        orientation: { x: 0, y: 1 },//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
        rotation: 0,//orientation angle
        maxSpeed: 3, //float //max magnitude of momentum
        momentum: { x: 0, y: 0 },
        graphics: MyGame.graphics,
    })

    this.ufo = []; //array of Ufo objects
    this.asteroids = []; //array of Asteroid objects
    this.projectiles = []; //array of Projectile objects

    this.remainingLives = 2; //int // lives remaining (2 would mean 3 total lives; 1 + 2 remaining)
    this.score = 0; //int //current score
    this.level = 0; //int //current level

}

MyGame.objects.GameModel.prototype.collides = function (obj1, obj2) {
    //check for collisions

    //return boolean
}

MyGame.objects.GameModel.prototype.notifyAsteroid = function (asteroid) {
    //do stuff
}

MyGame.objects.GameModel.prototype.notifyProjectile = function (projectile) {
    //do stuff
}

MyGame.objects.GameModel.prototype.update = function (elapsedTime) {
    this.player.update(elapsedTime);
    Array.prototype.push.apply(this.projectiles,this.player.projectiles);
    this.player.projectiles = [];//memory leak? do i need to null out the array first?

    //clean up any out-of-bounds projectiles
    let projectiles_copy = this.projectiles;
    this.projectiles.forEach(function (projectile, index) {
        if (projectile != null) {
            if (projectile.center.x > EDGE_BUFFER_MAX || projectile.center.x < EDGE_BUFFER_MIN || projectile.center.y > EDGE_BUFFER_MAX || projectile.center.y < EDGE_BUFFER_MIN) {
                projectiles_copy[index] = null;//destroy out of bounds projectiles
            } else {
                projectile.update();
            }
        }
    })
    this.projectiles = this.projectiles.filter(el => el != null);//clean up null entries caused by destroying out of bounds projectiles
}

MyGame.objects.GameModel.prototype.render = function () {
    // if(('projectiles' in this) && this.projectiles.length > 0){
    this.projectiles.forEach(function (projectile) {
        if (projectile != null) {
            projectile.render();
        }
    })
    // }
    this.player.renderer.render();
}