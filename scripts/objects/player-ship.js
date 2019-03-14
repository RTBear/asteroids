// --------------------------------------------------------------
//
// Creates a PlayerShip object, with functions for managing state.
//
// spec = {
//    hyperspaceStatus: , //float // how long until it can be used
//    //I think I have to include the spec stuff for things I inherit from (Ship)
//////////////////// SHIP ///////////////////////////////////////////////////////
//    accelerationRate: , //float //speed per time
//    turnRate: , //float //max rotations per time
//
//    //I think I have to include the spec stuff for things I inherit from (SpaceObject)
//////////////////// SPACE OBJECT //////////////////////////////////////////////////////
//    imageSrc: ,   // Web server location of the image
//    center: { x: , y: },
//    size: { width: , height: },
//    orientation: { x: , y: },//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
//    maxSpeed: , //float //max magnitude of momentum
//    graphics: reference to graphics renderer (MyGame.graphics)
// }
//
// --------------------------------------------------------------
MyGame.objects.PlayerShip = function (spec) {
    'use strict';

    MyGame.objects.Ship.call(this, spec);//call Ship constructor

}

MyGame.objects.PlayerShip.prototype = Object.create(MyGame.objects.Ship.prototype);//inherit from Ship object

MyGame.objects.SpaceObject.prototype.get_hyperspaceStatus = function() { return this.spec.hyperspaceStatus; }

MyGame.objects.PlayerShip.prototype.update = function (elapsedTime) {
    MyGame.objects.Ship.prototype.update.call(this);
    // console.log('PlayerShip update');
}

MyGame.objects.PlayerShip.prototype.fire = function (elapsedTime) {
    MyGame.objects.Ship.prototype.fire.call(this);
    console.log('PlayerShip fire');
}

MyGame.objects.PlayerShip.prototype.hyperspace = function (elapsedTime) {
    // console.log('PlayerShip fire');
}