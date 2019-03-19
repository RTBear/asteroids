// --------------------------------------------------------------
//
// Creates a GameModel object, with functions for managing state.
//
// --------------------------------------------------------------
MyGame.objects.GameModel = function () {
    'use strict';

    this.entities = [];//array of SpaceStates //TODO
    this.player = new MyGame.objects.PlayerShip({
        hyperspaceStatus: 5 * 1000, //float // how long until it can be used (ms)
        hyperspaceCooldown: 5 * 1000,
        accelerationRate: 10 / 1000, //float //speed per time
        turnRate: 0.5, //float //max rotations per time
        fireRate: 0.3 * 1000, //float //max shots per time ///////// RECOMMENDED FOR PRODUCTION
        // fireRate: 0.05 * 1000, //float //max shots per time ///////// JUST FOR FUN
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
    })

    this.ufo = []; //array of Ufo objects
    this.asteroids = []; //array of Asteroid objects
    this.projectiles = []; //array of Projectile objects

    ////////////////////////////////////////////////////////////////////////////////////////////

    let testAsteroid = new MyGame.objects.Asteroid({
        rotationRate: 0.01, //float //rotations per time
        rotationDirection: 1, //float // direction (>=0 is right; <0 is left;)

        imageSrc: './assets/asteroids/ball_gray.svg',   // Web server location of the image
        center: { x: 300, y: 100 },
        size: { x: ASTEROID_SIZES.LARGE, y: ASTEROID_SIZES.LARGE },
        orientation: { x: 1, y: 0 },//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
        rotation: 0, //float //orientation angle
        maxSpeed: 0, //float //max magnitude of momentum
        momentum: { x: 0, y: 0 }, //vector //current momentum
        graphics: MyGame.graphics
    });
    this.asteroids.push(testAsteroid);
    ////////////////////////////////////////////////////////////////////////////////////////////

    this.remainingLives = 2; //int // lives remaining (2 would mean 3 total lives; 1 + 2 remaining)
    this.score = 0; //int //current score
    this.level = 0; //int //current level
    this.gameOver = false; //is game over?

    this.asteroidSpawnTimeRange = { min: 0.1 * 1000, max: 1 * 1000 }; //range in milliseconds //TODO: maybe for further levels, modify max by the level (max/ level#) so they occur more frequently
    this.currentAsteroidSpawnTimer = Random.nextRange(this.asteroidSpawnTimeRange.min, this.asteroidSpawnTimeRange.max);

    this.ufoSpawnTimeRange = { min: 15 * 1000, max: 45 * 1000 }; //range in milliseconds
    this.currentUfoSpawnTimer = Random.nextRange(this.ufoSpawnTimeRange.min, this.ufoSpawnTimeRange.max);

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
    asteroidImageOptions = ['./assets/asteroids/ball_gray.svg', './assets/asteroids/ball_red.svg', './assets/asteroids/ball_yellow.svg'];
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
        const BUFFER = 10;
        let sides = {
            top: {
                zone: 'top',
                x: Random.nextRange(EDGE_BUFFER_MIN + 2 * BUFFER, EDGE_BUFFER_MAX - 2 * BUFFER),
                y: EDGE_BUFFER_MAX - BUFFER,
                rotation: Random.nextRange(225, 315) * Math.PI / 180,
            },
            right: {
                zone: 'right',
                x: EDGE_BUFFER_MAX - BUFFER,
                y: Random.nextRange(EDGE_BUFFER_MIN + 2 * BUFFER, EDGE_BUFFER_MAX - 2 * BUFFER),
                rotation: Random.nextRange(135, 225) * Math.PI / 180,
            },
            bottom: {
                zone: 'bottom',
                x: Random.nextRange(EDGE_BUFFER_MIN + 2 * BUFFER, EDGE_BUFFER_MAX - 2 * BUFFER),
                y: EDGE_BUFFER_MIN + BUFFER,
                rotation: Random.nextRange(45, 135) * Math.PI / 180,
            },
            left: {
                zone: 'left',
                x: EDGE_BUFFER_MIN + BUFFER,
                y: Random.nextRange(EDGE_BUFFER_MIN + 2 * BUFFER, EDGE_BUFFER_MAX - 2 * BUFFER),
                rotation: (405 - Random.nextRange(0, 45)) * Math.PI / 180,
            }
        }

        var spawnPoint = this.choose([sides.top, sides.right, sides.bottom, sides.left]);
    }

    spec.center = {};
    spec.center.x = spawnPoint.x;
    spec.center.y = spawnPoint.y;

    // spec.rotation = Random.nextRange(0, 361) * Math.PI / 180;//orientation angle
    spec.rotation = spawnPoint.rotation;//orientation angle
    // console.log(spawnPoint.zone)
    // console.log(spec.rotation * 180 / Math.PI)
    //also random
    spec.orientation = {};
    spec.orientation.x = Math.cos(spec.rotation);
    spec.orientation.y = Math.sin(spec.rotation);
    // console.log(spec.orientation)

    spec.momentum = {};
    spec.momentum.x = spec.orientation.x * Random.nextRange(150, spec.maxSpeed * 200) / spec.size.x;//.4 to (5 to 15) //TODO slow this down (small asteroids often move faster than my lasers)
    spec.momentum.y = spec.orientation.y * Random.nextRange(150, spec.maxSpeed * 200) / spec.size.x;//larger asteroids will move slower

    let asteroid = new MyGame.objects.Asteroid(spec)
    console.log(asteroid);
    this.asteroids.push(asteroid);
}

MyGame.objects.GameModel.prototype.generateUFO = function () {

}

MyGame.objects.GameModel.prototype.collides = function (obj1, obj2) {
    console.log('asters', this.asteroids);

    console.log('obj1', obj1);
    console.log('obj2', obj2);

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
        console.log('hhhhhhhhh', i)
        this.generateAsteroid(newSize, { x: center.x, y: center.y });
    }
}

MyGame.objects.GameModel.prototype.notifyAsteroid = function (asteroid) {
    //do stuff
    console.log(asteroid.size.x);
    let x = asteroid.center.x;
    let y = asteroid.center.y;
    //tell asteroid it was collided with
    if (asteroid.size.x > ASTEROID_SIZES.SMALL) {
        console.log('here')
        //break appart
        //determine new size of sub asteroids
        let size = ASTEROID_SIZES.LARGE;
        if (asteroid.size.x == ASTEROID_SIZES.LARGE) {
            console.log('here2')
            size = ASTEROID_SIZES.MEDIUM;
        } else if (asteroid.size.x == ASTEROID_SIZES.MEDIUM) {
            console.log('here3')
            size = ASTEROID_SIZES.SMALL;
        }
        //TODO: display particle effects for breaking asteroid
        //move asteroid off screen so it gets destroyed on next update
        asteroid.set_center({ x: EDGE_BUFFER_MAX + 1, y: EDGE_BUFFER_MAX + 1 })
        //create sub asteroids
        this.breakAsteroid({ x: x, y: y }, size, 3);//break apart takes an arg of how many pieces to break into
    } else {
        //TODO: display particle effects for destroying asteroid
        //move asteroid off screen so it gets destroyed on next update
        asteroid.set_center({ x: EDGE_BUFFER_MAX + 1, y: EDGE_BUFFER_MAX + 1 })
    }

}

MyGame.objects.GameModel.prototype.notifyProjectile = function (projectile) {
    //do stuff
    //tell projectile it was collided with
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
    // console.log(this.asteroids)
    this.player.update(elapsedTime);
    Array.prototype.push.apply(this.projectiles, this.player.projectiles);
    this.player.projectiles = [];//memory leak? do i need to null out the array first?

    //clean up any out-of-bounds projectiles
    let projectiles_copy = this.projectiles;
    this.projectiles.forEach(function (projectile, index) {
        if (projectile != null) {
            if (projectile.center.x > EDGE_BUFFER_MAX || projectile.center.x < EDGE_BUFFER_MIN || projectile.center.y > EDGE_BUFFER_MAX || projectile.center.y < EDGE_BUFFER_MIN) {
                projectiles_copy[index] = null;//destroy out of bounds projectiles
            } else {
                projectile.update(elapsedTime);
            }
        }
    })
    this.projectiles = this.projectiles.filter(el => el != null);//clean up null entries caused by destroying out of bounds projectiles

    if (this.currentAsteroidSpawnTimer > 0) {
        this.currentAsteroidSpawnTimer -= elapsedTime;
    } else {
        // console.log('ASTEROID CREATED');
        this.generateAsteroid(this.choose([ASTEROID_SIZES.SMALL, ASTEROID_SIZES.MEDIUM, ASTEROID_SIZES.LARGE]));//even distribution
        // this.generateAsteroid(this.choose([ASTEROID_SIZES.SMALL, ASTEROID_SIZES.MEDIUM, ASTEROID_SIZES.MEDIUM, ASTEROID_SIZES.LARGE]));//more mediums
        this.currentAsteroidSpawnTimer = Random.nextRange(this.asteroidSpawnTimeRange.min, this.asteroidSpawnTimeRange.max);
    }

    //clean up any out-of-bounds asteroids
    let asteroids_copy = this.asteroids;
    this.asteroids.forEach(function (asteroid, index) {
        if (asteroid != null) {
            if (asteroid.center.x > EDGE_BUFFER_MAX || asteroid.center.x < EDGE_BUFFER_MIN || asteroid.center.y > EDGE_BUFFER_MAX || asteroid.center.y < EDGE_BUFFER_MIN) {
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

    for (let ast in this.asteroids) {
        if(this.collides(this.player,this.asteroids[ast])){
            console.log('####################################');
            console.log('####################################');
            console.log('MAN DOWN');
            console.log('####################################');
            console.log('####################################');
            this.gameOver = true;
            return;
        }
    }
    ///CRUDE COLLISION DETECTION AMONG PROJECTILES AND ASTEROIDS FOR TESTING
    for (let ast in this.asteroids) {
        for (let laser in this.projectiles) {
            if (this.collides(this.projectiles[laser], this.asteroids[ast])) {
                console.log('HIT');
                console.log('lasers', this.projectiles)
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

    //TODO: render asteroids
    this.asteroids.forEach(function (asteroid) {//render projectiles
        if (asteroid != null) {
            // console.log(asteroid)
            asteroid.render();
        }
    })
    //TODO: render UFOs

    this.player.renderer.render();//render player
}