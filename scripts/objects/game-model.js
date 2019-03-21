// --------------------------------------------------------------
//
// Creates a GameModel object, with functions for managing state.
//
// --------------------------------------------------------------
MyGame.objects.GameModel = function () {
    'use strict';

    this.entities = [];//array of SpaceStates //TODO
    this.player = new MyGame.objects.PlayerShip({
        // hyperspaceStatus: 5 * 1000, //float // how long until it can be used (ms)
        hyperspaceStatus: 0, //float // how long until it can be used (ms)
        // hyperspaceCooldown: 5 * 1000,
        hyperspaceCooldown: .05 * 1000,
        accelerationRate: 10 / 1000, //float //speed per time
        turnRate: 0.5, //float //max rotations per time
        // fireRate: 0.2 * 1000, //float //max shots per time ///////// RECOMMENDED FOR PRODUCTION
        fireRate: 0.005 * 1000, //float //max shots per time ///////// JUST FOR FUN
        projectileSpeed: 10,
        projectileAccelerationRate: 1,

        imageSrc: './assets/ships/starship.svg',   // Web server location of the image
        center: { x: 300, y: 300 },
        size: { x: 50, y: 50 },
        orientation: { x: 0, y: 1 },//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
        rotation: 0,//orientation angle
        maxSpeed: 3, //float //max magnitude of momentum
        momentum: { x: 0, y: 0 },
        graphics: MyGame.graphics,
    });
    this.playerSpawnBuffer = ASTEROID_SIZES.LARGE / 2 + this.player.collider[0][0].circumference / 2;
    this.remainingLives = 2000; //int // lives remaining (2 would mean 3 total lives; 1 + 2 remaining)

    this.ufo = []; //array of Ufo objects
    this.asteroids = []; //array of Asteroid objects
    this.projectiles = []; //array of Projectile objects

    this.score = 0; //int //current score
    this.level = 0; //int //current level
    this.gameOver = false; //is game over?
    this.asteroidsLeftToSpawn = Math.ceil(this.level * 1.5);

    this.maxAsteroidSpeedModifier = 100;
    this.minAsteroidSpeed = 0.01;

    this.ufoSpawnTimeRange = { min: 15 * 1000, max: 45 * 1000 }; //range in milliseconds
    this.currentUfoSpawnTimer = Random.nextRange(this.ufoSpawnTimeRange.min, this.ufoSpawnTimeRange.max);

    let spawnPointDensity = 10;
    this.spawnPoints = [];

    for (let x = GAME_SIZE_X / spawnPointDensity; x < GAME_SIZE_X; x += GAME_SIZE_X / spawnPointDensity) {
        for (let y = GAME_SIZE_Y / spawnPointDensity; y < GAME_SIZE_Y; y += GAME_SIZE_Y / spawnPointDensity) {
            this.spawnPoints.push({
                x: x,
                y: y,
            })
        }
    }

    console.log('SPAWN POINTS', this.spawnPoints);

    this.maxRecDep = 100;//maximum recursive depth for functions which use this
    this.computeSafeLocationCounter = this.maxRecDep;
}
MyGame.objects.GameModel.prototype.choose = function (list) {
    //choose a random item from a list
    index = Random.nextRange(0, list.length);
    return list[index];
}

MyGame.objects.GameModel.prototype.generateAsteroid = function (size, center = null) {
    spec = {
        rotationRate: Random.nextRange(1, 15) / 100,
        rotationDirection: Random.nextRange(-1, 2),

        maxSpeed: Random.nextRange(10, 20) / 10, //float //max magnitude of momentum 10,25 would be 1 to 2.5
        graphics: MyGame.graphics,
    }
    //these will vary by asteroid size
    //TODO: do something like I did with "sides" and have each image associated with a color (so I can have the particle effects be the same color)
    // asteroidImageOptions = ['./assets/asteroids/ball_gray.svg', './assets/asteroids/ball_red.svg', './assets/asteroids/ball_yellow.svg'];
    asteroidImageOptions = ['./assets/asteroids/ball_gray.svg']; //for now... I only like the gray one
    spec.imageSrc = this.choose(asteroidImageOptions);
    spec.size = {};
    spec.size.x = size;
    spec.size.y = spec.size.x;

    if (center != null) {
        var spawnPoint = {
            x: center.x,
            y: center.y,
            rotation: Random.nextRange(0, 360) * Math.PI / 180,
        };
    } else {

        //starting location will be random unless specified
        let sides = {//TODO: don't always spawn on the edges .... this looks kinda silly with more asteroids. Spawn in a range between player location +- a buffer zone and edge of screen
            top: {
                zone: 'top',
                x: Random.nextRange(0, GAME_SIZE_X),
                y: GAME_SIZE_Y,
                rotation: Random.nextRange(225, 315) * Math.PI / 180,
            },
            right: {
                zone: 'right',
                x: GAME_SIZE_X,
                y: Random.nextRange(0, GAME_SIZE_Y),
                rotation: Random.nextRange(135, 225) * Math.PI / 180,
            },
            bottom: {
                zone: 'bottom',
                x: Random.nextRange(0, GAME_SIZE_X),
                y: 0,
                rotation: Random.nextRange(45, 135) * Math.PI / 180,
            },
            left: {
                zone: 'left',
                x: 0,
                y: Random.nextRange(0, GAME_SIZE_Y),
                rotation: (405 - Random.nextRange(0, 45)) * Math.PI / 180,
            }
        }

        var spawnPoint = this.choose([sides.top, sides.right, sides.bottom, sides.left]);
    }

    spec.center = {};
    spec.center.x = spawnPoint.x;
    spec.center.y = spawnPoint.y;

    spec.rotation = spawnPoint.rotation;//orientation angle

    //also random
    spec.orientation = {};
    spec.orientation.x = Math.cos(spec.rotation);
    spec.orientation.y = Math.sin(spec.rotation);

    spec.momentum = {};
    spec.momentum.x = spec.orientation.x * Random.nextRange(this.minAsteroidSpeed, spec.maxSpeed * this.maxAsteroidSpeedModifier) / spec.size.x;//.4 to (5 to 15) //TODO slow this down (small asteroids often move faster than my lasers)
    spec.momentum.y = spec.orientation.y * Random.nextRange(this.minAsteroidSpeed, spec.maxSpeed * this.maxAsteroidSpeedModifier) / spec.size.x;//larger asteroids will move slower

    let asteroid = new MyGame.objects.Asteroid(spec)
    this.asteroids.push(asteroid);
}

MyGame.objects.GameModel.prototype.generateUFO = function () {

}

MyGame.objects.GameModel.prototype.collides = function (obj1, obj2) {
    // console.log('asters', this.asteroids);

    // console.log('obj1', obj1);
    // console.log('obj2', obj2);

    //check for collisions
    // for(let i = 0; i < obj1.length)
    if (!obj1.collider[0][0].overlapsCircle(obj2.collider[0][0].center.x, obj2.collider[0][0].center.y, obj2.collider[0][0].circumference)) {
        //outer bounding boxes do not collide; fail early
        return false;
    }
    // let x2 = obj2.center.x;
    // let y2 = obj2.center.y;
    // let c2 = obj2.center.circum

    //return boolean
    return true;//nothing collides for now
}

MyGame.objects.GameModel.prototype.breakAsteroid = function (center, newSize, pieces = 3) {
    //create new asteroids
    for (let i = 0; i < pieces; i++) {
        this.generateAsteroid(newSize, { x: center.x, y: center.y });
    }
}

MyGame.objects.GameModel.prototype.notifyAsteroid = function (asteroid) {
    let x = asteroid.center.x;
    let y = asteroid.center.y;
    //tell asteroid it was collided with
    if (asteroid.size.x > ASTEROID_SIZES.SMALL) {
        //determine new size of sub asteroids
        let newSize = ASTEROID_SIZES.SMALL;//assuming size is medium (this line) or large (below)
        let newPieces = 4;
        if (asteroid.size.x == ASTEROID_SIZES.LARGE) {
            newSize = ASTEROID_SIZES.MEDIUM;
            newPieces = 3;
        }
        //TODO: display particle effects for breaking asteroid
        asteroid.remove();//expire asteroid so it gets destroyed on next update
        this.breakAsteroid({ x: x, y: y }, newSize, newPieces); //create sub asteroids
    } else {
        //TODO: display particle effects for destroying asteroid
        asteroid.remove();//expire asteroid so it gets destroyed on next update
    }

}

MyGame.objects.GameModel.prototype.notifyProjectile = function (projectile) {
    //do stuff
    //tell projectile it was collided with
}

MyGame.objects.GameModel.prototype.incrementScore = function (howMuch) {
    this.score += howMuch;
}

MyGame.objects.GameModel.prototype.losePlayerLife = function () {
    console.log('####################################');
    console.log('MAN DOWN');
    console.log('####################################');
    if (this.remainingLives <= 0) {
        this.remainingLives = 0;//make sure it does not keep going negative until overflow
        this.gameOver = true;
    } else {
        this.remainingLives -= 1;
        // this.projectiles = [];//should I do this?
        console.log('=============================================')

        this.player.respawn(this.computeSafeLocation());
    }
}

MyGame.objects.GameModel.prototype.computeDistance = function (x1, y1, x2, y2) {
    //keep x keep y
    var d0 = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

    //keep x wrap y
    if (y2 > y1) {
        var d1 = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - (y1 + GAME_SIZE_Y)) * (y2 - (y1 + GAME_SIZE_Y)));//y1 would wrap
    } else {
        var d1 = Math.sqrt((x2 - x1) * (x2 - x1) + ((y2 + GAME_SIZE_Y) - y1) * ((y2 + GAME_SIZE_Y) - y1));//y2 would wrap
    }

    //wrap x keep y
    if (x2 > x1) {
        var d2 = Math.sqrt((x2 - (x1 + GAME_SIZE_X)) * (x2 - (x1 + GAME_SIZE_X)) + (y2 - y1) * (y2 - y1));//x1 would wrap
    } else {
        var d2 = Math.sqrt(((x2 + GAME_SIZE_X) - x1) * ((x2 + GAME_SIZE_X) - x1) + (y2 - y1) * (y2 - y1));//y2 would wrap
    }

    //wrap x wrap y
    if (y2 > y1) {
        var dy3 = (y2 - (y1 + GAME_SIZE_Y));
    } else {
        var dy3 = ((y2 + GAME_SIZE_Y) - y1);
    }
    if (x2 > x1) {
        var dx3 = (x2 - (x1 + GAME_SIZE_X));
    } else {
        var dx3 = ((x2 + GAME_SIZE_X) - x1);
    }
    var d3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);

    let dist = Math.min(d0, d1, d2, d3);
    // console.log(x1, y1, x2, y2)
    // console.log(this.playerSpawnBuffer, d0, d1, d2, d3, ':::', dist);
    return dist;
}

MyGame.objects.GameModel.prototype.computeSafestSpawnPoint = function () {

}

MyGame.objects.GameModel.prototype.computeSafeLocation = function () {

    let possibleLocation_x = Random.nextRange(0 + this.player.size.x, GAME_SIZE_X - this.player.size.x);
    let possibleLocation_y = Random.nextRange(0 + this.player.size.y, GAME_SIZE_Y - this.player.size.y);

    // console.log(possibleLocation_x, possibleLocation_y, '&&&&&&&&')

    this.possibleLocation_x = possibleLocation_x;
    this.possibleLocation_y = possibleLocation_y;

    // this.render();

    // console.log('pl', possibleLocation_x, possibleLocation_y, '^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    let safeLocation = true;
    for (let ast in this.asteroids) {
        if (this.computeDistance(this.asteroids[ast].center.x, this.asteroids[ast].center.y, possibleLocation_x, possibleLocation_y) < this.playerSpawnBuffer) {
            console.log(this.asteroids[ast].center)
            safeLocation = false;
        }
    }

    if (safeLocation) {
        this.computeSafeLocationCounter = this.maxRecDep;
        return {
            x: possibleLocation_x,
            y: possibleLocation_y
        }
    } else {
        this.computeSafeLocationCounter--;
        if (this.computeSafeLocationCounter > 0) {
            return this.computeSafeLocation();//try again
        } else {
            this.computeSafeLocationCounter = this.maxRecDep;//reset recursion depth counter
            console.log('Could not find "safe" spawns... spawning in safest location');
            return this.computeSafestSpawnPoint();//find point on predetermined grid that is the "safest" ie furthest from all other projectiles while not right next to another projectile
        }
    }
}

////////////////////////////////////////////////////////////
//  _______  _______  ______   _______ _________ _______  //
// |\     /|(  ____ )(  __  \ (  ___  )\__   __/(  ____ \ //
// | )   ( || (    )|| (  \  )| (   ) |   ) (   | (    \/ //
// | |   | || (____)|| |   ) || (___) |   | |   | (__     //
// | |   | ||  _____)| |   | ||  ___  |   | |   |  __)    //
// | |   | || (      | |   ) || (   ) |   | |   | (       //
// | (___) || )      | (__/  )| )   ( |   | |   | (____/\ //
// (_______)|/       (______/ |/     \|   )_(   (_______/ //
////////////////////////////////////////////////////////////                                                   

MyGame.objects.GameModel.prototype.update = function (elapsedTime) {


    // this.player.fire();


    // console.log(this.asteroids)
    this.player.update(elapsedTime);
    Array.prototype.push.apply(this.projectiles, this.player.projectiles);
    this.player.projectiles = [];//memory leak? do i need to null out the array first?

    if (this.player.requestNewLocation == true) {
        this.player.requestNewLocation = false;
        console.log('--------------------------------------------------')

        this.player.respawn(this.computeSafeLocation());
    }

    //clean up any expired projectiles
    let projectiles_copy = this.projectiles;
    this.projectiles.forEach(function (projectile, index) {
        if (projectile != null) {
            if (projectile.expired == true) {
                projectiles_copy[index] = null;//destroy out of bounds asteroids
            } else {
                projectile.update(elapsedTime);
            }
        }
    })
    this.projectiles = this.projectiles.filter(el => el != null);//clean up null entries caused by destroying out of bounds projectiles

    //check for increment level
    if (this.asteroids.length == 0) {//if level cleared
        console.log('level: ' + this.level)
        this.level++;
        this.asteroidsLeftToSpawn = Math.ceil(this.level * 1.5);
        for (let i = 0; i <= this.asteroidsLeftToSpawn; --this.asteroidsLeftToSpawn) {
            this.generateAsteroid(ASTEROID_SIZES.LARGE);//TODO: make sure do not spawn on other asteroids or player
        }
    }

    //clean up any expired asteroids
    let asteroids_copy = this.asteroids;
    this.asteroids.forEach(function (asteroid, index) {
        if (asteroid != null) {
            if (asteroid.expired == true) {
                asteroids_copy[index] = null;//destroy out of bounds asteroids
            } else {
                asteroid.update(elapsedTime);
            }
        }
    })
    this.asteroids = this.asteroids.filter(el => el != null);//clean up null entries caused by destroying out of bounds asteroids

    if (this.currentUfoSpawnTimer > 0) {
        this.currentUfoSpawnTimer -= elapsedTime;
    } else {
        console.log('UFO CREATED');
        this.currentUfoSpawnTimer = Random.nextRange(this.ufoSpawnTimeRange.min, this.ufoSpawnTimeRange.max);
    }

    //CRUDE COLLISION CHECK FOR PLAYER AND ASTEROIDS
    for (let ast in this.asteroids) {
        if (this.collides(this.player, this.asteroids[ast])) {
            this.losePlayerLife();
            return;
        }
    }
    ///CRUDE COLLISION DETECTION AMONG PROJECTILES AND ASTEROIDS FOR TESTING
    for (let ast in this.asteroids) {
        for (let laser in this.projectiles) {
            if (this.collides(this.projectiles[laser], this.asteroids[ast])) {
                // console.log('HIT');
                // console.log('lasers', this.projectiles)
                this.incrementScore(Math.ceil(ASTEROID_SIZES.LARGE / this.asteroids[ast].size.x));
                this.notifyAsteroid(this.asteroids[ast]);
                this.projectiles[laser] = null;
                this.projectiles = this.projectiles.filter(el => el != null);//clean up null entries caused by destroying out of bounds asteroids
                break;
            }
        }
    }
}

MyGame.objects.GameModel.prototype.render = function () {
    this.projectiles.forEach(function (projectile) {//render projectiles
        if (projectile != null) {
            projectile.render();
        }
    })

    //render asteroids
    this.asteroids.forEach(function (asteroid) {//render projectiles
        if (asteroid != null) {
            // console.log(asteroid)
            asteroid.render();
            MyGame.graphics.drawCircle({
                center: {
                    x: asteroid.center.x,
                    y: asteroid.center.y
                },
                circum: asteroid.size.x
            })
            MyGame.graphics.drawCircle({
                center: {
                    x: asteroid.center.x,
                    y: asteroid.center.y
                },
                circum: 5
            })


            MyGame.graphics.drawCircle({
                center: {
                    x: asteroid.center.x + GAME_SIZE_X,
                    y: asteroid.center.y
                },
                circum: asteroid.size.x
            })
            MyGame.graphics.drawCircle({
                center: {
                    x: asteroid.center.x - GAME_SIZE_X,
                    y: asteroid.center.y
                },
                circum: asteroid.size.x
            })
            MyGame.graphics.drawCircle({
                center: {
                    x: asteroid.center.x,
                    y: asteroid.center.y + GAME_SIZE_Y
                },
                circum: asteroid.size.x
            })
            MyGame.graphics.drawCircle({
                center: {
                    x: asteroid.center.x,
                    y: asteroid.center.y - GAME_SIZE_Y
                },
                circum: asteroid.size.x
            })
        }
    })
    //TODO: render UFOs

    MyGame.graphics.drawCircle({
        center: {
            x: this.player.center.x,
            y: this.player.center.y
        },
        circum: this.playerSpawnBuffer * 2
    })

    MyGame.graphics.drawCircle({
        center: {
            x: this.player.center.x,
            y: this.player.center.y
        },
        circum: this.player.size.x
    })

    MyGame.graphics.drawCircle({
        center: {
            x: this.possibleLocation_x,
            y: this.possibleLocation_y
        },
        circum: this.playerSpawnBuffer * 2
    })

    this.player.renderer.render();//render player

    this.spawnPoints.forEach(function (sp) {//render projectiles
        // console.log(asteroid)
        MyGame.graphics.drawCircle({
            center: {
                x: sp.x,
                y: sp.y
            },
            circum: 5
        });
    })
}