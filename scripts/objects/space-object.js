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
//    momentum: { x: , y: }, //vector //current momentum
//    graphics: //reference to graphics renderer (MyGame.graphics)
// }
//
// --------------------------------------------------------------
MyGame.objects.SpaceObject = function (spec) {
    'use strict';
    
    this.center = {};
    this.center.x = spec.center.x;
    this.center.y = spec.center.y;

    this.size = {};
    this.size.x = spec.size.x;
    this.size.y = spec.size.y;
    
    this.orientation = {};
    this.orientation.x = spec.orientation.x;
    this.orientation.y = spec.orientation.y;
    
    this.rotation = {value:spec.rotation};

    this.maxSpeed = spec.maxSpeed;

    this.momentum = {};
    this.momentum.x = spec.momentum.x;
    this.momentum.y = spec.momentum.y;

    this.renderer = MyGame.render.SpaceObject({
        imageSrc: spec.imageSrc,
        center: this.center,
        rotation: this.rotation,//these are intentionally passed by reference
        size: this.size,
    });

    this.updateRotation = function() {//pretty sure this is a "bug" ie not intended behavior as a result of the renderer 
        spec.rotation = this.rotation;
    }
}

MyGame.objects.SpaceObject.prototype.get_size = function () { return this.size; }

MyGame.objects.SpaceObject.prototype.get_rotation = function () { return this.rotation.value; }
MyGame.objects.SpaceObject.prototype.set_rotation = function (rot) {
    this.rotation.value = ((rot + 2*Math.PI) % (2*Math.PI)); }

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

MyGame.objects.SpaceObject.prototype.get_momentum = function () { 
    return {
        x: this.momentum.x,
        y: this.momentum.y
    };
}
MyGame.objects.SpaceObject.prototype.set_momentum = function (momentum) { 
    this.momentum.x = momentum.x; 
    this.momentum.y = momentum.y; 
}

MyGame.objects.SpaceObject.prototype.get_center = function () { 
    return {
        x: this.center.x,
        y: this.center.y
    };
}
MyGame.objects.SpaceObject.prototype.set_center = function (center) { 
    this.center.x = center.x; 
    this.center.y = center.y; 
}

MyGame.objects.SpaceObject.prototype.update = function (elapsedTime) {
    this.updateRotation();
    // console.log((this.rotation * 180/Math.PI + 360) % 360)
}

MyGame.objects.SpaceObject.prototype.render = function () {
    if(('projectiles' in this) && this.projectiles.length > 0){
        this.projectiles.forEach(function(projectile){
            if (projectile != null){
                projectile.render();
            }
        })
    }
    this.renderer.render();
}