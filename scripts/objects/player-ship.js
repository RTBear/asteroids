// --------------------------------------------------------------
//
// Creates a PlayerShip object, with functions for managing state.
//
// spec = {
//    hyperspaceStatus: , //float // how long until it can be used
//    hyperspaceCooldown: , //float // how long between uses
//    projectileSpeed: , //float //max speed (momentum) of projectiles
//    projectileAccelerationRate: , //float //acceleration rate of projectiles
//    id: ,//id for ship
//    shipType: , //type of ship ie 'player',
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

    this.projectileSpeed = spec.projectileSpeed;
    this.projectileAccelerationRate = spec.projectileAccelerationRate;

    this.projectiles = [];//array containing lasers
    this.lastGunFired = 3;

    this.requestNewLocation = false;
    this.id = spec.id;
    this.shipType = spec.shipType;

    this.computeExhaustLocations = function(){
        this.exhaustLocation_left = {x: this.center.x - this.orientation.x * 14 - this.orientation.y * 5, y:this.center.y + this.orientation.y * 14 - this.orientation.x * 5};
        this.exhaustLocation_right = {x: this.center.x - this.orientation.x * 14 + this.orientation.y * 5, y:this.center.y + this.orientation.y * 14 + this.orientation.x * 5};
    }
    this.computeExhaustLocations();

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
        this.hyperspaceStatus = 0;
    }


}

MyGame.objects.PlayerShip.prototype.nextGunToFire = function () {
    if (this.lastGunFired == 0) {
        this.lastGunFired = 3;
        return 3;
    } else if (this.lastGunFired == 1) {
        this.lastGunFired = 2;
        return 2;
    } else if (this.lastGunFired == 2) {
        this.lastGunFired = 0;
        return 0;
    } else if (this.lastGunFired == 3) {
        this.lastGunFired = 1;
        return 1;
    }
    this.lastGunFired = 3;//shouldn't get here
    return 1;
}

MyGame.objects.PlayerShip.prototype.fire = function (elapsedTime) {
    if (this.canFire()) {
        MyGame.objects.Ship.prototype.fire.call(this, elapsedTime);

        let current_location = this.get_center();
        let current_orientation = this.get_orientation();
        let current_rotation = this.get_rotation();
        // console.log('ship center',current_momentum,current_momentum.x,current_momentum.y, typeof current_momentum.x)

        let gun0_x = current_location.x - current_orientation.y * 15.5;
        let gun0_y = current_location.y - current_orientation.x * 15.5;

        let gun1_x = current_location.x - current_orientation.y * 9.5;
        let gun1_y = current_location.y - current_orientation.x * 9.5;

        let gun2_x = current_location.x + current_orientation.y * 9.5;
        let gun2_y = current_location.y + current_orientation.x * 9.5;

        let gun3_x = current_location.x + current_orientation.y * 15.5;
        let gun3_y = current_location.y + current_orientation.x * 15.5;

        let guns = [{ x: gun0_x, y: gun0_y }, { x: gun1_x, y: gun1_y }, { x: gun2_x, y: gun2_y }, { x: gun3_x, y: gun3_y }]
        let nextGunToFire = this.nextGunToFire();

        let angle = this.get_rotation() * 180 / Math.PI - 90;//convert to degrees 
        this.particleSystem.createExhaust(guns[nextGunToFire].x, guns[nextGunToFire].y, this.size.x, './assets/particle-effects/blue.png', {min: angle - 45, max: angle + 45});

        let laser = new MyGame.objects.Projectile({
            owner: this, //reference to owner ship
            accelerationRate: this.projectileAccelerationRate,

            // imageSrc: './assets/ships/starship.svg',   // Web server location of the image
            imageSrc: './assets/projectiles/projectile2.svg',   // Web server location of the image
            center: { x: guns[nextGunToFire].x, y: guns[nextGunToFire].y },
            size: { x: 30, y: 30 },
            orientation: { x: current_orientation.x, y: current_orientation.y },//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
            rotation: current_rotation, //float //orientation angle
            maxSpeed: this.projectileSpeed, //float //max magnitude of momentum
            momentum: { x: 0, y: 0 }, //vector //start at zero so projectiles go straight
            graphics: this.graphics//reference to graphics renderer (MyGame.graphics)
        });

        this.projectiles.push(laser);

    }
}

MyGame.objects.PlayerShip.prototype.respawn = function (location) {
    this.center.x = location.x;
    this.center.y = location.y;
    this.momentum.x = 0;
    this.momentum.y = 0;
    this.hyperspaceStatus = this.hyperspaceCooldown; //reset hyperspace cooldown
    this.fireCountdown = this.fireRate; //reset weapon cooldown
    //reset weapon
    this.projectiles = [];//array containing lasers
    this.lastGunFired = 3;
    this.particleSystem.createExplosion(this.center.x, this.center.y, this.size.x * 1.5, './assets/particle-effects/yellow.png');
}

MyGame.objects.PlayerShip.prototype.hyperspace = function (elapsedTime) {
    if (this.hyperspaceStatus == 0) {
        this.particleSystem.createExplosion(this.center.x, this.center.y, this.size.x, './assets/particle-effects/yellow.png');
        this.hyperspaceStatus = this.hyperspaceCooldown; //reset cooldown
        this.requestNewLocation = true;
    }
}