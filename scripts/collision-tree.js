// --------------------------------------------------------------
//
// Creates a CollisionTree object (quad-tree of SpaceObject objects), with functions for managing state.
//
// spec = {
//    size: //float //size of total detection collision area (square)
// }
//
// --------------------------------------------------------------
MyGame.objects.CollisionTree = function (spec) {
    'use strict';

    this.size = spec.size;

}

//add inheritable functions
// MyGame.objects.CollisionTree.prototype.get_accelerationRate = function () { return this.accelerationRate; }

MyGame.objects.CollisionTree.prototype.addChild = function (child) {
    //do stuff
}

MyGame.objects.CollisionTree.prototype.checkCollisions = function () {
    //return list of pairs of colliding objects?
    //or maybe do stuff? //probably just return list as gameModel has functions for notifying ufos and missles
}

MyGame.objects.CollisionTree.prototype.update = function (elapsedTime) {
    //do stuff
}