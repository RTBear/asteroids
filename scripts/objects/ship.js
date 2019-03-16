// --------------------------------------------------------------
//
// Creates a Ship object, with functions for managing state.
//
// spec = {
//    accelerationRate: , //float //speed per time
//    turnRate: , //float //max rotations per time
//    fireRate: , //float //max shots per time
//
////////////////////////////////////////////////////////////////////////////////////////
//    //I think I have to include the spec stuff for things I inherit from (SpaceObject)
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
MyGame.objects.Ship = function (spec) {
    'use strict';

    MyGame.objects.SpaceObject.call(this, spec);//call SpaceObject constructor

    this.turnRate = spec.turnRate;
    this.accelerationRate = spec.accelerationRate;
    this.fireRate = spec.fireRate;
    this.fireCountdown = this.fireRate;

}

MyGame.objects.Ship.prototype = Object.create(MyGame.objects.SpaceObject.prototype);//inherit from SpaceObject object

//add inheritable functions
MyGame.objects.Ship.prototype.get_accelerationRate = function () { return this.accelerationRate; }
MyGame.objects.Ship.prototype.get_turnRate = function () {
    return this.turnRate;
}

MyGame.objects.Ship.prototype.vectorMagnitude = function (v = { x: 0, y: 0 }) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

MyGame.objects.Ship.prototype.accelerate = function (elapsedTime) {
    let current_momentum = this.get_momentum();
    let orientation = this.get_orientation();
    let max_speed = this.get_maxSpeed();

    //if magnitude of momentum > max_speed
    //  adjust it to hav magnitude such that mag(momentum) == max_speed


    let new_momentum_x, new_momentum_y;

    let current_mag_momentum = MyGame.objects.Ship.prototype.vectorMagnitude(current_momentum);//current magnitude of momentum

    if (current_mag_momentum > max_speed) {
        new_momentum_x = max_speed/current_mag_momentum * current_momentum.x;
        new_momentum_y = max_speed/current_mag_momentum * current_momentum.y;

    } else {

        new_momentum_x = current_momentum.x + (orientation.x * this.accelerationRate);
        new_momentum_y = current_momentum.y + (orientation.y * this.accelerationRate);

        if (new_momentum_x > max_speed) {
            new_momentum_x = max_speed;
        } else if (new_momentum_x < -max_speed) {
            new_momentum_x = -max_speed;
        }

        if (new_momentum_y > max_speed) {
            new_momentum_y = max_speed;
        } else if (new_momentum_y < -max_speed) {
            new_momentum_y = -max_speed;
        }
    }


    this.set_momentum({
        x: new_momentum_x,
        y: new_momentum_y,
    })
}

MyGame.objects.Ship.prototype.turnLeft = function (elapsedTime) {
    var rotation = this.get_rotation();
    var newRotation = rotation * 180 / Math.PI - (elapsedTime * this.get_turnRate());

    this.set_orientation({
        x: Math.sin(newRotation * Math.PI / 180),
        y: Math.cos(newRotation * Math.PI / 180)
    });
    this.set_rotation(newRotation * Math.PI / 180);
}

MyGame.objects.Ship.prototype.turnRight = function (elapsedTime) {
    var rotation = this.get_rotation();
    var newRotation = rotation * 180 / Math.PI + (elapsedTime * this.get_turnRate());

    this.set_orientation({
        x: Math.sin(newRotation * Math.PI / 180),
        y: Math.cos(newRotation * Math.PI / 180)
    });
    this.set_rotation(newRotation * Math.PI / 180);
}

MyGame.objects.Ship.prototype.canFire = function () { return this.fireCountdown == 0; }
MyGame.objects.Ship.prototype.fire = function (elapsedTime) {
    if (this.canFire()) {
        this.fireCountdown = this.fireRate;
    }
}

MyGame.objects.Ship.prototype.update = function (elapsedTime) {
    MyGame.objects.SpaceObject.prototype.update.call(this, elapsedTime);
    if (this.fireCountdown > 0) {
        this.fireCountdown -= elapsedTime;
    } else {
        // console.log('Weapon ready');
        this.fireCountdown = 0;
    }

    this.set_center({
        x: this.get_center().x + this.get_momentum().x,
        y: this.get_center().y - this.get_momentum().y,//minus because y0 is at top of screen
    })
    // console.log('m', this.get_momentum());
    // console.log('c', this.get_center());
}