// --------------------------------------------------------------
//
// Creates a GameModel object, with functions for managing state.
//
// --------------------------------------------------------------
MyGame.objects.GameModel = function (spec) {
    'use strict';

    this.entities = [];//array of SpaceStates //TODO
    this.player = new MyGame.objects.PlayerShip({
        hyperspaceStatus: 5 * 1000, //float // how long until it can be used (ms)
        hyperspaceCooldown: 5 * 1000,
        accelerationRate: 0.1, //float //speed per time
        turnRate: 0.5, //float //max rotations per time
        fireRate: 0.3 * 1000, //float //max shots per time ///////// RECOMMENDED FOR PRODUCTION
        // fireRate: 0.05 * 1000, //float //max shots per time ///////// JUST FOR FUN

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

    // this.renderer = MyGame.render.GameModel({// TODO: maybe make this a player renderer (handle scope here instead of making sure it is passed by reference from the space-object)
    //     imageSrc: spec.imageSrc,
    //     center: this.center,
    //     rotation: this.rotation,//these are intentionally passed by reference
    //     size: this.size,
    // });

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
}

MyGame.objects.GameModel.prototype.render = function () {
    // if(('projectiles' in this) && this.projectiles.length > 0){
    this.projectiles.forEach(function (projectile) {
        if (projectile != null) {
            projectile.render();
        }
    })
    // }
    this.renderer.render();
}