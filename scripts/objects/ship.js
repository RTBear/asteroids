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
//    size: { width: , height: },
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
    console.log('ship turnLeft');
    console.log(this)
    console.log(this.get_orientation().y)
    console.log(this.get_orientation().x)
    let or = this.get_orientation();
    if (or.x == 0){
        var currentAngle = 0;
    }else{
        var currentAngle = Math.atan(or.y/or.x);
    }
    console.log(currentAngle)
    console.log('et',elapsedTime)
    let newAngle = currentAngle - (elapsedTime * this.get_turnRate());
    console.log(newAngle)
    this.set_orientation({
        x: Math.cos(newAngle),
        y: Math.sin(newAngle)
    });

}

MyGame.objects.Ship.prototype.turnRight = function (elapsedTime) {
    console.log('ship turnRight');
    this.get_orientation();
    let or = this.get_orientation();
    console.log(or)
    
    // if (or.y == 0){
    //     var currentAngle_x = 0;
    //     var currentAngle_y = 0;
    // }else{
    //     // var currentAngle = 2*Math.atan(or.y/or.x);
    //     var currentAngle = Math.atan(or.x/or.y);
    //     var currentAngle_x = Math.acos(or.x);
    //     var currentAngle_y = Math.asin(or.y);
    //     // var currentAngle = or.y;
    // }

    // console.log('curr',currentAngle)
    console.log('curr',currentAngle*180/Math.PI)
    // console.log('et',elapsedTime)


    // let newAngle_x = currentAngle_x*180/Math.PI + (elapsedTime * this.get_turnRate());
    // let newAngle_y = currentAngle_y*180/Math.PI + (elapsedTime * this.get_turnRate());
    let newAngle = (currentAngle*180/Math.PI) + (elapsedTime * this.get_turnRate())/2;
    // console.log('new',newAngle)
    // console.log('new',newAngle*180/Math.PI)


    // this.set_orientation({
    //     x: Math.cos(newAngle_x*Math.PI/180),
    //     y: Math.sin(newAngle_y*Math.PI/180)
    // });

    // this.set_orientation({
    //     x: Math.cos(newAngle*Math.PI/180),
    //     y: Math.sin(newAngle*Math.PI/180)
    // });
    this.set_orientation({
        x: Math.sin(newAngle*Math.PI/180),
        y: Math.cos(newAngle*Math.PI/180)
    });

    // this.set_orientation({
    //     x: Math.cos(Math.acos(or.x) + (elapsedTime * this.get_turnRate())),
    //     y: Math.sin(Math.acos(or.y) + (elapsedTime * this.get_turnRate())),
    // });
}

MyGame.objects.Ship.prototype.fire = function (elapsedTime) {
    // console.log('ship fire');
}

MyGame.objects.Ship.prototype.update = function (elapsedTime) {
    MyGame.objects.SpaceObject.prototype.update.call(this);
    // console.log('ship update');
}