// --------------------------------------------------------------
//
// Creates a PlayerShip object, with functions for managing state.
//
// spec = {
//    hyperspaceStatus: , //float // how long until it can be used
//    hyperspaceCooldown: , //float // how long between uses
//    //I think I have to include the spec stuff for things I inherit from (Ship)
//////////////////// SHIP ///////////////////////////////////////////////////////
//    accelerationRate: , //float //speed per time
//    turnRate: , //float //max rotations per time
//    fireRate: , //float //max shots per time
//
//    //I think I have to include the spec stuff for things I inherit from (SpaceObject)
//////////////////// SPACE OBJECT //////////////////////////////////////////////////////
//    imageSrc: ,   // Web server location of the image
//    center: { x: , y: },
//    size: { x: , y: },
//    orientation: { x: , y: },//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
//    rotation: , //float //orientation angle
//    maxSpeed: , //float //max magnitude of momentum
//    momentum: { x: , y: }, //vector //current momentum
//    graphics: //reference to graphics renderer (MyGame.graphics)
// }
//
// --------------------------------------------------------------
MyGame.objects.PlayerShip = function (spec) {
    'use strict';

    MyGame.objects.Ship.call(this, spec);//call Ship constructor

    this.hyperspaceStatus = spec.hyperspaceStatus;
    this.hyperspaceCooldown = spec.hyperspaceCooldown;

    this.projectileSpeed = 10;
    this.projectileAccelerationRate = 1000;

    this.projectiles = [];//array containing lasers

    // this.fireSound = new Audio();
}

MyGame.objects.PlayerShip.prototype = Object.create(MyGame.objects.Ship.prototype);//inherit from Ship object

MyGame.objects.SpaceObject.prototype.get_hyperspaceStatus = function () { return this.hyperspaceStatus; }
MyGame.objects.SpaceObject.prototype.set_hyperspaceStatus = function (hs) { this.hyperspaceStatus = hs; }

MyGame.objects.PlayerShip.prototype.update = function (elapsedTime) {
    MyGame.objects.Ship.prototype.update.call(this, elapsedTime);
    if (this.hyperspaceStatus > 0) {
        this.hyperspaceStatus -= elapsedTime;
    } else {
        console.log('hyperspace ready');
        this.hyperspaceStatus = 0;
    }
    let projectiles_copy = this.projectiles;
    this.projectiles.forEach(function (laser, index) { //TODO: this should be handled by the game model :O
        if (laser != null) {
            // console.log('laser', laser.center)
            if (laser.center.x > EDGE_BUFFER_MAX || laser.center.x < EDGE_BUFFER_MIN || laser.center.y > EDGE_BUFFER_MAX || laser.center.y < EDGE_BUFFER_MIN) {
                projectiles_copy[index] = null;//destroy out of bounds projectiles
            } else {
                laser.update();
            }
        }
    })
    console.log('lasers',this.projectiles)
    this.projectiles = this.projectiles.filter(el => el != null);//clean up null entries caused by
    console.log('clean lasers',this.projectiles)

}

MyGame.objects.PlayerShip.prototype.fire = function (elapsedTime) {
    if (this.canFire()) {
        MyGame.objects.Ship.prototype.fire.call(this, elapsedTime);
        console.log('PlayerShip fire]]]>({<-------------');

        let current_location = this.get_center();
        let current_orientation = this.get_orientation();
        let current_momentum = this.get_momentum();
        let current_rotation = this.get_rotation();
        // console.log('ship center',current_momentum,current_momentum.x,current_momentum.y, typeof current_momentum.x)

        let laser = new MyGame.objects.Projectile({
            owner: this, //reference to owner ship
            accelerationRate: this.projectileAccelerationRate,

            // imageSrc: './assets/ships/starship.svg',   // Web server location of the image
            imageSrc: './assets/projectiles/projectile2.svg',   // Web server location of the image
            center: { x: current_location.x, y: current_location.y },
            size: { x: 50, y: 50 },
            orientation: { x: current_orientation.x, y: current_orientation.y },//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
            rotation: current_rotation, //float //orientation angle
            maxSpeed: this.projectileSpeed, //float //max magnitude of momentum
            momentum: { x: 0, y: 0 }, //vector //current momentum
            graphics: this.graphics//reference to graphics renderer (MyGame.graphics)
        });


        this.projectiles.push(laser);

    }
}

MyGame.objects.PlayerShip.prototype.hyperspace = function (elapsedTime) {
    if (this.hyperspaceStatus == 0) {
        console.log('PlayerShip Hyperspace!!!');
        this.hyperspaceStatus = this.hyperspaceCooldown; //reset cooldown
    }
}