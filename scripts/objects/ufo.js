// --------------------------------------------------------------
//
// Creates a UFO object, with functions for managing state.
//
// spec = {
//    rotationRate: , //float //rotations per time
//    rotationDirection: , //float // direction (>=0 is right; <0 is left;)
//    projectileSpeed: , //float //max speed (momentum) of projectiles
//    projectileAccelerationRate: , //float //acceleration rate of projectiles
//    id: ,//id for ship
//    shipType: , //type of ship ie 'ufo',
//    //I think I have to include the spec stuff for things I inherit from (Ship)
//////////////////// SHIP ///////////////////////////////////////////////////////
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
MyGame.objects.UFO = function (spec) {
    'use strict';

    MyGame.objects.Ship.call(this, spec);//call Ship constructor

    this.rotationRate = spec.rotationRate;
    this.rotationDirection = spec.rotationDirection;

    this.projectileSpeed = spec.projectileSpeed;
    this.projectileAccelerationRate = spec.projectileAccelerationRate;

    this.projectiles = [];//array containing lasers
    this.id = spec.id;
    this.shipType = spec.shipType;
    // this.fireSound = new Audio();
}

MyGame.objects.UFO.prototype = Object.create(MyGame.objects.Ship.prototype);//inherit from Ship object

MyGame.objects.UFO.prototype.update = function (elapsedTime) {
    MyGame.objects.Ship.prototype.update.call(this, elapsedTime);
    this.rotate(elapsedTime);
    this.fire();
    this.set_center({
        x: this.get_center().x + this.get_momentum().x,
        y: this.get_center().y - this.get_momentum().y,//minus because y0 is at top of screen
    })
}

MyGame.objects.UFO.prototype.rotate = function (elapsedTime) {
    let rotation = this.get_rotation();//from SpaceObject

    let newRotation;
    if (this.rotationDirection >= 0) {
        //rotate right
        newRotation = rotation * 180 / Math.PI + (elapsedTime * this.rotationRate);
    } else if (this.rotationDirection < 0) {
        //rotate left
        newRotation = rotation * 180 / Math.PI - (elapsedTime * this.rotationRate);
    }

    this.set_orientation({
        x: Math.sin(newRotation * Math.PI / 180),
        y: Math.cos(newRotation * Math.PI / 180)
    });
    this.set_rotation(newRotation * Math.PI / 180);
}

MyGame.objects.UFO.prototype.fire = function (elapsedTime) {
    // console.log('ufo fire');
    if (this.canFire()) {
        // console.log('ufo can fire');

        MyGame.objects.Ship.prototype.fire.call(this, elapsedTime);

        let current_location = this.get_center();
        let current_orientation = this.get_orientation();
        let current_rotation = this.get_rotation();
        // console.log('ship center',current_momentum,current_momentum.x,current_momentum.y, typeof current_momentum.x)

        let laser = new MyGame.objects.Projectile({
            owner: this, //reference to owner ship
            accelerationRate: this.projectileAccelerationRate,

            // imageSrc: './assets/ships/starship.svg',   // Web server location of the image
            imageSrc: './assets/projectiles/torpedo.svg',   // Web server location of the image
            center: { x: current_location.x, y: current_location.y },
            size: { x: 30, y: 30 },
            orientation: { x: current_orientation.x, y: current_orientation.y },//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
            rotation: current_rotation, //float //orientation angle
            maxSpeed: this.projectileSpeed, //float //max magnitude of momentum
            momentum: { x: 0, y: 0 }, //vector //start at zero so projectiles go straight
            graphics: this.graphics,//reference to graphics renderer (MyGame.graphics)
            range: 5 * 1000,
        });
        // console.log(laser)
        this.projectiles.push(laser);

    }
}