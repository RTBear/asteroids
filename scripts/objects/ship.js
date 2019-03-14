// --------------------------------------------------------------
//
// Creates a Ship object, with functions for managing state.
//
// spec = {
//    accelerationRate: , //float //speed per time
//    turnRate: , //float //max rotations per time
//
////////////////////////////////////////////////////////////////////////////////////////
//    //I think I have to include the spec stuff for things I inherit from (SpaceObject)
//    imageSrc: ,   // Web server location of the image
//    center: { x: , y: },
//    size: { x: , y: },
//    orientation: { x: , y: },//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
//    maxSpeed: , //float //max magnitude of momentum
//    graphics: reference to graphics renderer (MyGame.graphics)
// }
//
// --------------------------------------------------------------
MyGame.objects.Ship = function (spec) {
    'use strict';

    MyGame.objects.SpaceObject.call(this, spec);//call SpaceObject constructor

    this.turnRate = spec.turnRate;
    this.accelerationRate = spec.accelerationRate;
    this.fireRate = spec.fireRate;

}

MyGame.objects.Ship.prototype = Object.create(MyGame.objects.SpaceObject.prototype);//inherit from SpaceObject object

//add inheritable functions

MyGame.objects.SpaceObject.prototype.get_accelerationRate = function() { return this.spec.accelerationRate; }
MyGame.objects.SpaceObject.prototype.get_turnRate = function() { 
    return this.turnRate; 
}

MyGame.objects.Ship.prototype.accelerate = function (elapsedTime) {
    console.log('ship accelerate');
}

MyGame.objects.Ship.prototype.turnLeft = function (elapsedTime) {
    var rotation = this.get_rotation();
    var newRotation = rotation*180/Math.PI - (elapsedTime * this.get_turnRate());

    this.set_orientation({
        x: Math.sin(newRotation*Math.PI/180),
        y: Math.cos(newRotation*Math.PI/180)
    });
    this.set_rotation(newRotation*Math.PI/180);
}

MyGame.objects.Ship.prototype.turnRight = function (elapsedTime) {
    var rotation = this.get_rotation();
    var newRotation = rotation*180/Math.PI + (elapsedTime * this.get_turnRate());

    this.set_orientation({
        x: Math.sin(newRotation*Math.PI/180),
        y: Math.cos(newRotation*Math.PI/180)
    });
    this.set_rotation(newRotation*Math.PI/180);
}

MyGame.objects.Ship.prototype.fire = function (elapsedTime) {
    console.log('ship fire');
}

MyGame.objects.Ship.prototype.update = function (elapsedTime) {
    MyGame.objects.SpaceObject.prototype.update.call(this);
    // console.log('ship update');
}