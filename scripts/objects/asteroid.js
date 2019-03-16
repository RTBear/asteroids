// --------------------------------------------------------------
//
// Creates a Asteroid object, with functions for managing state.
//
// spec = {
//    rotationRate: , //float //rotations per time
//    rotationDirection: , //float // direction (>=0 is right; <0 is left;)
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
MyGame.objects.Asteroid = function (spec) {
    'use strict';

    MyGame.objects.SpaceObject.call(this, spec);//call Ship constructor

    this.rotationRate = spec.rotationRate;
    this.rotationDirection = spec.rotationDirection;
}

MyGame.objects.Asteroid.prototype = Object.create(MyGame.objects.SpaceObject.prototype);//inherit from Ship object

//add inheritable functions
MyGame.objects.Asteroid.prototype.rotate = function (elapsedTime) {
    let rotation = this.get_rotation();//from SpaceObject

    let newRotation;
    if(this.rotationDirection >= 0){
        //rotate right
        newRotation = rotation * 180 / Math.PI + (elapsedTime * this.rotationRate);
    }else if (this.rotationDirection < 0){
        //rotate left
        newRotation = rotation * 180 / Math.PI - (elapsedTime * this.rotationRate);
    }

    this.set_orientation({
        x: Math.sin(newRotation * Math.PI / 180),
        y: Math.cos(newRotation * Math.PI / 180)
    });
    this.set_rotation(newRotation * Math.PI / 180);
}

MyGame.objects.Asteroid.prototype.update = function (elapsedTime) {
    MyGame.objects.SpaceObject.prototype.update.call(this, elapsedTime);

    this.rotate(elapsedTime);

    this.set_center({
        x: this.get_center().x + this.get_momentum().x,
        y: this.get_center().y - this.get_momentum().y,//minus because y0 is at top of screen
    })
}