// --------------------------------------------------------------
//
// Creates a Circle object, with functions for managing state.
//
// spec = {
//    center: { x: , y: },
//    circumference: , //float
// }
//
// --------------------------------------------------------------
MyGame.objects.Circle = function (center_x, center_y, circumference) {
    'use strict';
    
    this.center = {};
    this.center.x = center_x;
    this.center.y = center_y;

    this.circumference = circumference;
}

MyGame.objects.Circle.prototype.getCenter = function () {
    return {
        x: this.center.x,
        y: this.center.y
    };
}

MyGame.objects.Circle.prototype.getCircumference = function () {
    return this.circumference;
}

MyGame.objects.Circle.prototype.containsXY = function (x,y) {//point (x,y) is inside circle (including border)
    //if distance from (x,y) to center of circle is less than radius of circle, return true
    let dist = Math.sqrt((x - this.center.x)*(x - this.center.x) + (y - this.center.y)*(y - this.center.y));
    if(dist <= this.circumference / 2){
        return true;
    }else{
        return false;
    }
}

MyGame.objects.Circle.prototype.overlapsCircle = function (x2,y2,circum2) {//point (x,y) is inside circle (including border)
    //if distance between two centers is greater than sum of radii of circles, no intersection; otherwise, they at least touch
    let dist = Math.sqrt((x2 - this.center.x)*(x2 - this.center.x) + (y2 - this.center.y)*(y2 - this.center.y));
    let sumOfRadii = (this.circumference / 2) + (circum2 / 2);
    // console.log('dist',dist);
    // console.log('sumOfRadii',sumOfRadii);
    if(dist > sumOfRadii){
        return false;
    }else{
        return true;
    }
}