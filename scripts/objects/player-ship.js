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

    this.hyperspaceStatus = spec.hyperspaceStatus;
    this.hyperspaceCooldown = spec.hyperspaceCooldown;
}

MyGame.objects.PlayerShip.prototype = Object.create(MyGame.objects.Ship.prototype);//inherit from Ship object

MyGame.objects.SpaceObject.prototype.get_hyperspaceStatus = function() { return this.hyperspaceStatus; }
MyGame.objects.SpaceObject.prototype.set_hyperspaceStatus = function(hs) { this.hyperspaceStatus = hs; }

MyGame.objects.PlayerShip.prototype.update = function (elapsedTime) {
    MyGame.objects.Ship.prototype.update.call(this, elapsedTime);
    if (this.hyperspaceStatus > 0){
        this.hyperspaceStatus -= elapsedTime;
    }else{
        console.log('hyperspace ready');
        this.hyperspaceStatus = 0;
    }
}

MyGame.objects.PlayerShip.prototype.fire = function (elapsedTime) {
    if(this.canFire()){
        MyGame.objects.Ship.prototype.fire.call(this, elapsedTime);
        console.log('PlayerShip fire]]]>({<-------------');
    }
}

MyGame.objects.PlayerShip.prototype.hyperspace = function (elapsedTime) {
    if(this.hyperspaceStatus == 0){
        console.log('PlayerShip Hyperspace!!!');
        this.hyperspaceStatus = this.hyperspaceCooldown; //reset cooldown
    }
}