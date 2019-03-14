// --------------------------------------------------------------
//
// Creates a SpaceObject object, with functions for managing state.
//
// spec = {
//    imageSrc: ,   // Web server location of the image
//    center: { x: , y: },
//    size: { x: , y: },
//    orientation: { x: , y: },//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
//    rotation: , //float //orientation angle
//    maxSpeed: , //float //max magnitude of momentum
//    momentum: , //float //current momentum
//    graphics: //reference to graphics renderer (MyGame.graphics)
// }
//
// --------------------------------------------------------------
MyGame.objects.SpaceObject = function (spec) {
    'use strict';
    this.rotation = spec.rotation;
    
    this.center = {};
    this.center.x = spec.center.x;
    this.center.y = spec.center.y;

    this.orientation = {};
    this.orientation.x = spec.orientation.x;
    this.orientation.y = spec.orientation.y;

    this.momentum = spec.momentum;
    this.renderer = MyGame.render.SpaceObject(spec);

    this.updateRotation = function() {
        spec.rotation = this.rotation;
    }
}

MyGame.objects.SpaceObject.prototype.get_center = function () { return this.center; }
MyGame.objects.SpaceObject.prototype.get_size = function () { return this.size; }

MyGame.objects.SpaceObject.prototype.get_rotation = function () { return this.rotation; }
MyGame.objects.SpaceObject.prototype.set_rotation = function (rot) { this.rotation = rot; }

MyGame.objects.SpaceObject.prototype.get_orientation = function () {
    return {
        x: this.orientation.x,
        y: this.orientation.y
    };
}
MyGame.objects.SpaceObject.prototype.set_orientation = function (orientation) {
    this.orientation.x = orientation.x;
    this.orientation.y = orientation.y;
}

MyGame.objects.SpaceObject.prototype.get_maxSpeed = function () { return this.maxSpeed; }

MyGame.objects.SpaceObject.prototype.get_momentum = function () { return this.momentum; }
MyGame.objects.SpaceObject.prototype.set_momentum = function (momentum) { this.momentum = momentum; }

MyGame.objects.SpaceObject.prototype.update = function (elapsedTime) {
    this.updateRotation();
}

MyGame.objects.SpaceObject.prototype.render = function () {
    this.renderer.render();
}