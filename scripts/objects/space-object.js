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
    this.size.x = spec.size.x;//TODO: For now could use this (the larger of x or y) as diameter for bounding circle... ideally should sub-divide or maybe add a "collider" property
    this.size.y = spec.size.y;

    this.collider = [];//array of hierarchical bounding sub-divisions e.g. [[circle1],[circle2,circle3,circle4]] where circle1 is largest, outermost bounding circle and circles 2-4 are inner circles. Can add as many layers as desired.
    if(this.size.x > this.size.y){
        //if wider than tall
        this.collider.push([new MyGame.objects.Circle(this.center.x,this.center.y,this.size.x)]);
    }else{
        //if taller than wide
        this.collider.push([new MyGame.objects.Circle(this.center.x,this.center.y,this.size.y)]);
    }

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

    this.expired = false;

}
// MyGame.objects.SpaceObject.prototype = Object.create(MyGame.objects.GameModel.prototype);//inherit from GameModel object //THIS IS WRONG?

MyGame.objects.SpaceObject.prototype.get_size = function () { return this.size; }

MyGame.objects.SpaceObject.prototype.remove = function(){ this.expired = true; }//doesn't actually remove object, just flags it for removal by gameModel

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

    if (this.center.x > GAME_SIZE_X){
        this.center.x = 0;
    }else if (this.center.x < 0){
        this.center.x = GAME_SIZE_X;
    }
    if (this.center.y > GAME_SIZE_Y){
        this.center.y = 0;
    }else if (this.center.y < 0){
        this.center.y = GAME_SIZE_Y;
    }
}

MyGame.objects.SpaceObject.prototype.update_collider = function() {
    //compute change in x,y
    //re-compute sub-circles //TODO: do this later, only worrying about one circle for now.
    //rotate to match rotation //TODO: do this later, only worrying about one circle for now.

    let delta_x = this.center.x - this.collider[0][0].center.x;
    let delta_y = this.center.y - this.collider[0][0].center.y;

    //update outer bound
    for(let level = 0; level < this.collider.length; level++){
        for(let circ = 0; circ < this.collider[level].length; circ++){
            this.collider[level][circ].center.x += delta_x;
            this.collider[level][circ].center.y += delta_y;
        }
    }


    // if(this.size.x > this.size.y){
    //     //if wider than tall
    //     this.collider.push(new MyGame.objects.Circle(this.center.x,this.center.y,this.size.x));
    // }else{
    //     //if taller than wide
    //     this.collider.push(new MyGame.objects.Circle(this.center.x,this.center.y,this.size.y));
    // }
}

MyGame.objects.SpaceObject.prototype.update = function (elapsedTime) {
    this.update_collider();
}

MyGame.objects.SpaceObject.prototype.render = function () {
    this.renderer.render();
}