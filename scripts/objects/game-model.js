// --------------------------------------------------------------
//
// Creates a GameModel object, with functions for managing state.
//
// --------------------------------------------------------------
MyGame.objects.GameModel = function (particleSystem, audioSystem) {
    'use strict';
    this.nextID = 1;
    // this.entities = [];//array of SpaceStates //TODO
    console.log(particleSystem);
    this.particleSystem = particleSystem;
    this.audioSystem = audioSystem;

    this.player = new MyGame.objects.PlayerShip({
        // hyperspaceStatus: 0, //float // how long until it can be used (ms)
        // hyperspaceCooldown: 0.05 * 1000,
        hyperspaceStatus: 3 * 1000, //float // how long until it can be used (ms)
        hyperspaceCooldown: 3 * 1000,
        accelerationRate: 10 / 1000, //float //speed per time
        turnRate: 0.5, //float //max rotations per time
        fireRate: 0.2 * 1000, //float //max shots per time ///////// RECOMMENDED FOR PRODUCTION
        // fireRate: 0.005 * 1000, //float //max shots per time ///////// JUST FOR FUN
        projectileSpeed: 15,
        projectileAccelerationRate: 1,

        imageSrc: './assets/ships/starship.svg',   // Web server location of the image
        center: { x: GAME_SIZE_X / 2, y: GAME_SIZE_Y / 2 },
        size: { x: 50, y: 50 },
        orientation: { x: 0, y: 1 },//orientation angle where x = Math.cos(angle) and y = Math.sin(angle) //used as the direction of acceleration
        rotation: 0,//orientation angle
        maxSpeed: 3, //float //max magnitude of momentum
        momentum: { x: 0, y: 0 },
        graphics: MyGame.graphics,
        id: 0,
        shipType: 'player',
        particleSystem: this.particleSystem,
        audioSystem: this.audioSystem,
    });
    this.playerSpawnBuffer = ASTEROID_SIZES.LARGE / 2 + this.player.collider[0][0].circumference / 2;
    this.remainingLives = 2; //int // lives remaining (2 would mean 3 total lives; 1 + 2 remaining)

    this.ufos = []; //array of Ufo objects
    this.asteroids = []; //array of Asteroid objects
    this.projectiles = []; //array of Projectile objects

    this.score = 0; //int //current score
    this.level = 0; //int //current level
    this.gameOver = false; //is game over?
    this.gameStarted = false; //have we started yet?
    this.asteroidsLeftToSpawn = Math.ceil(this.level * 1.5);

    this.maxAsteroidSpeedModifier = 100;
    this.minAsteroidSpeed = 0.01;

    this.maxUFOSpeedModifier = 10;
    this.minUFOSpeed = 0.01;
    this.UFO_KILL_SCORE = 10;
    this.UFO_PROJECTILE_KILL_SCORE = 0;
    this.OnlyDestoryersNowPoint = 40000;
    this.UFOsLeftToSpawn = this.level;

    // this.ufoSpawnTimeRange = { min: 15 * 1000, max: 45 * 1000 }; //range in milliseconds
    // this.currentUfoSpawnTimer = Random.nextRange(this.ufoSpawnTimeRange.min, this.ufoSpawnTimeRange.max);

    this.ufoSpawnTimeRange = { min: .0001 * 1000, max: .0002 * 1000 }; //range in milliseconds
    this.currentUfoSpawnTimer = Random.nextRange(this.ufoSpawnTimeRange.min, this.ufoSpawnTimeRange.max);

    let spawnPointDensity = 20;

    this.calculateSpawnPoints = function () {
        this.spawnPoints = [];
        //calculate spawn points
        for (let x = GAME_SIZE_X / spawnPointDensity; x <= GAME_SIZE_X - GAME_SIZE_X / spawnPointDensity; x += GAME_SIZE_X / spawnPointDensity) {
            for (let y = GAME_SIZE_Y / spawnPointDensity; y < GAME_SIZE_Y; y += GAME_SIZE_Y / spawnPointDensity) {
                this.spawnPoints.push({
                    x: x,
                    y: y,
                })
            }
        }
    }

    this.calculateSpawnPoints();

    this.maxRecDep = 20;//maximum recursive depth for functions which use this
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
        var spawnPoint = this.randomObstacleSpawn();
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

MyGame.objects.GameModel.prototype.generateUFO = function (center) {
    let probabilityOfDestroyer = this.score / this.OnlyDestoryersNowPoint; //probability of getting destroyer increases
    probabilityOfDestroyer = (probabilityOfDestroyer > 1) ? 1 : probabilityOfDestroyer; //upper bound of probability at 1
    probabilityOfDestroyer = (probabilityOfDestroyer < 0.5) ? 0.5 : probabilityOfDestroyer; //lower bound of probability at .5
    spec = {
        rotationRate: Random.nextRange(1, 15) / 100,
        rotationDirection: Random.nextRange(-1, 2),

        fireRate: 3 * 1000, //float //max shots per time ///////// JUST FOR FUN
        projectileSpeed: 3,
        projectileAccelerationRate: 0.005,

        maxSpeed: Random.nextRange(10, 20) / 10, //float //max magnitude of momentum 10,25 would be 1 to 2.5
        graphics: MyGame.graphics,
        id: this.nextID++,
        shipType: 'ufo',
        particleSystem: this.particleSystem,
        audioSystem: this.audioSystem,
    }
    asteroidImageOptions = ['./assets/ships/ufo.svg']; //for now... maybe add the dark one later
    spec.imageSrc = this.choose(asteroidImageOptions);

    spec.size = {
        x: 50,
        y: 50
    };

    if (center != null) {
        var spawnPoint = {
            x: center.x,
            y: center.y,
            rotation: Random.nextRange(0, 360) * Math.PI / 180,
        };
    } else {
        //starting location will be random unless specified
        var spawnPoint = this.randomObstacleSpawn();
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
    spec.momentum.x = spec.orientation.x * Random.nextRange(this.minUFOSpeed, spec.maxSpeed * this.maxUFOSpeedModifier) / spec.size.x;//.4 to (5 to 15) //TODO slow this down (small asteroids often move faster than my lasers)
    spec.momentum.y = spec.orientation.y * Random.nextRange(this.minUFOSpeed, spec.maxSpeed * this.maxUFOSpeedModifier) / spec.size.x;//larger asteroids will move slower

    let ufo = new MyGame.objects.UFO(spec)
    this.ufos.push(ufo);
}

MyGame.objects.GameModel.prototype.randomObstacleSpawn = function () {
    let sides = {
        top: {
            zone: 'top',
            x: Random.nextRange(0, GAME_SIZE_X),
            y: Random.nextRange(0, this.player.center.y - this.playerSpawnBuffer, GAME_SIZE_Y),
            rotation: Random.nextRange(225, 315) * Math.PI / 180,
        },
        right: {
            zone: 'right',
            x: Random.nextRange(this.player.center.x + this.playerSpawnBuffer, GAME_SIZE_X),
            y: Random.nextRange(0, GAME_SIZE_Y),
            rotation: Random.nextRange(135, 225) * Math.PI / 180,
        },
        bottom: {
            zone: 'bottom',
            x: Random.nextRange(0, GAME_SIZE_X),
            y: Random.nextRange(this.player.center.y + this.playerSpawnBuffer, GAME_SIZE_Y),
            rotation: Random.nextRange(45, 135) * Math.PI / 180,
        },
        left: {
            zone: 'left',
            x: Random.nextRange(0, this.player.center.x - this.playerSpawnBuffer),
            y: Random.nextRange(0, GAME_SIZE_Y),
            rotation: (405 - Random.nextRange(0, 45)) * Math.PI / 180,
        }
    }

    var spawnPoint = this.choose([sides.top, sides.right, sides.bottom, sides.left]);
    return spawnPoint;
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
    this.audioSystem.playSound('boomAsteroid');
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
        this.particleSystem.createExplosion(asteroid.center.x, asteroid.center.y, asteroid.size.x, './assets/particle-effects/rubble.png');
        asteroid.remove();//expire asteroid so it gets destroyed on next update
        this.breakAsteroid({ x: x, y: y }, newSize, newPieces); //create sub asteroids
    } else {
        this.particleSystem.createExplosion(asteroid.center.x, asteroid.center.y, asteroid.size.x, './assets/particle-effects/rubble.png');
        asteroid.remove();//expire asteroid so it gets destroyed on next update
    }
}

MyGame.objects.GameModel.prototype.notifyUFO = function (ufo) {
    this.particleSystem.createExplosion(ufo.center.x, ufo.center.y, ufo.size.x, './assets/particle-effects/ship-piece.png');
    this.audioSystem.playSound('boomUFO');
    ufo.remove();//expire asteroid so it gets destroyed on next update
}

MyGame.objects.GameModel.prototype.notifyProjectile = function (projectile) {
    //tell projectile it was collided with
    this.particleSystem.createExplosion(projectile.center.x, projectile.center.y, projectile.size.x, './assets/particle-effects/ship-piece.png');
    this.audioSystem.playSound('boomMissle');
    projectile.remove();
}

MyGame.objects.GameModel.prototype.incrementScore = function (howMuch) {
    this.score += howMuch;
}

MyGame.objects.GameModel.prototype.losePlayerLife = function () {
    console.log('DEAD :(', this.player.center)
    this.particleSystem.createExplosion(this.player.center.x, this.player.center.y, this.player.size.x, './assets/particle-effects/ship-piece.png');
    this.audioSystem.playSound('boomPlayer');
    if (this.remainingLives <= 0) {
        this.remainingLives = 0;//make sure it does not keep going negative until overflow
        this.gameOver = true;
    } else {
        this.remainingLives -= 1;
        // this.projectiles = [];//should I do this?

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

MyGame.objects.GameModel.prototype.computeSafestSpawnPoint = function () {//TODO: factor in ufo and ufo projectiles
    let safestPoint = this.spawnPoints[0];
    let maxDistance = 0;
    for (sp of this.spawnPoints) {
        let distForSP = 0;//total distance from safepoint to all dangerous objects
        let closestDanger = GAME_SIZE_X * GAME_SIZE_X + GAME_SIZE_Y * GAME_SIZE_Y; //can't be farther than this

        let ufoProjectiles = this.projectiles.filter(proj => proj.owner.shipType != 'player');

        for (let obj of Array.prototype.concat(this.asteroids, ufoProjectiles, this.ufos)) {
            let dist = this.computeDistance(sp.x, sp.y, obj.center.x, obj.center.y);
            let collisionDist = (dist - (obj.size.x / 2));//distance from spawn point to center of obj minus radius of obj
            if (collisionDist < closestDanger) {
                closestDanger = collisionDist;//check if new distance is the closest seen
            }
            if (closestDanger < this.player.collider[0][0].circumference / 2) {//if it would immediately collide with outermost collider for player
                break;//break out early
            }
            distForSP += collisionDist;
        }

        if (distForSP > maxDistance) {
            //found the new safest point
            safestPoint = {
                x: sp.x,
                y: sp.y,
            };
            maxDistance = distForSP;
        }
    }
    console.log(safestPoint);
    return safestPoint;
}

MyGame.objects.GameModel.prototype.computeSafeLocation = function () {//TODO: factor in ufo and ufo projectiles

    let possibleLocation_x = Random.nextRange(0 + this.player.size.x, GAME_SIZE_X - this.player.size.x);
    let possibleLocation_y = Random.nextRange(0 + this.player.size.y, GAME_SIZE_Y - this.player.size.y);

    // console.log(possibleLocation_x, possibleLocation_y, '&&&&&&&&')

    this.possibleLocation_x = possibleLocation_x;
    this.possibleLocation_y = possibleLocation_y;

    // this.render();

    // console.log('pl', possibleLocation_x, possibleLocation_y, '^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    let safeLocation = true;

    let ufoProjectiles = this.projectiles.filter(proj => proj.owner.shipType != 'player');

    for (let obj of Array.prototype.concat(this.asteroids, ufoProjectiles, this.ufos)) {
        if (this.computeDistance(obj.center.x, obj.center.y, possibleLocation_x, possibleLocation_y) < this.playerSpawnBuffer) {
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

MyGame.objects.GameModel.prototype.update = function (elapsedTime) {
    if (!this.gameOver && this.gameStarted) {
        this.player.update(elapsedTime);
        //add player projectiles to game
        Array.prototype.push.apply(this.projectiles, this.player.projectiles);
        this.player.projectiles = [];//memory leak? do i need to null out the array first?

        if (this.player.requestNewLocation == true) {

            this.player.requestNewLocation = false;

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

        //check for NEXT LEVEL
        if (this.asteroids.length == 0 && this.UFOsLeftToSpawn <= 0 && this.ufos.length == 0) {//if level cleared
            this.level++;

            this.currentUfoSpawnTimer = Random.nextRange(this.ufoSpawnTimeRange.min, this.ufoSpawnTimeRange.max);//reset ufo spawn timer
            this.UFOsLeftToSpawn = this.level;//set number of UFOs for next level

            this.asteroidsLeftToSpawn = Math.ceil(this.level * 1.5);
            for (let i = 0; i <= this.asteroidsLeftToSpawn; --this.asteroidsLeftToSpawn) {
                this.generateAsteroid(ASTEROID_SIZES.LARGE);
            }
        }

        //clean up any expired asteroids
        let asteroids_copy = this.asteroids;
        this.asteroids.forEach(function (asteroid, index) {
            if (asteroid != null) {
                if (asteroid.expired == true) {
                    asteroids_copy[index] = null;//destroy expired asteroids
                } else {
                    asteroid.update(elapsedTime);
                }
            }
        })
        this.asteroids = this.asteroids.filter(el => el != null);//clean up null entries caused by destroying asteroids

        if (this.currentUfoSpawnTimer > 0) {
            this.currentUfoSpawnTimer -= elapsedTime;
        } else {
            if (this.UFOsLeftToSpawn > 0) {
                this.generateUFO();
                this.currentUfoSpawnTimer = Random.nextRange(this.ufoSpawnTimeRange.min, this.ufoSpawnTimeRange.max);//reset timer for next ufo
                this.UFOsLeftToSpawn--;
            } else {
                this.UFOsLeftToSpawn = 0;
            }
        }

        //clean up any expired asteroids
        let ufos_copy = this.ufos;
        let allUFOprojectiles = [];
        this.ufos.forEach(function (ufo, index) {
            if (ufo != null) {
                if (ufo.expired == true) {
                    ufos_copy[index] = null;//destroy expired ufos
                } else {
                    ufo.update(elapsedTime);
                    //add ufo projectiles to game
                    Array.prototype.push.apply(allUFOprojectiles, ufo.projectiles);
                    ufo.projectiles = [];//memory leak? do i need to null out the array first?
                }
            }
        })
        Array.prototype.push.apply(this.projectiles, allUFOprojectiles);
        this.ufos = this.ufos.filter(el => el != null);//clean up null entries caused by destroying ufos

        this.checkCollisions();
    }
}

MyGame.objects.GameModel.prototype.checkCollisions = function () {
    //NAIVE COLLISION CHECK FOR PLAYER AND UFOS
    for (let ufo in this.ufos) {
        if (this.collides(this.player, this.ufos[ufo])) {
            console.log('ufo keeled you', this.ufos[ufo])
            this.losePlayerLife();
            return;
        }
    }
    //NAIVE COLLISION CHECK FOR PLAYER AND ASTEROIDS
    for (let ast in this.asteroids) {
        if (this.collides(this.player, this.asteroids[ast])) {
            console.log('asteroid keeled you', this.asteroids[ast])
            this.losePlayerLife();
            return;
        }
    }
    ///NAIVE COLLISION DETECTION AMONG PROJECTILES AND ASTEROIDS
    for (let ast in this.asteroids) {
        for (let laser in this.projectiles) {
            if (this.collides(this.projectiles[laser], this.asteroids[ast])) {
                if (this.projectiles[laser].owner.shipType == 'player') {
                    this.incrementScore(Math.ceil(ASTEROID_SIZES.LARGE / this.asteroids[ast].size.x));
                }
                this.notifyAsteroid(this.asteroids[ast]);

                this.projectiles[laser].explode();
                this.projectiles[laser] = null;
                this.projectiles = this.projectiles.filter(el => el != null);//clean up null entries caused by destroying expired asteroids
                break;
            }
        }
    }
    ///NAIVE COLLISION DETECTION AMONG PROJECTILES AND UFOS
    for (let ufo in this.ufos) {
        for (let laser in this.projectiles) {
            if (this.projectiles[laser].owner.id != this.ufos[ufo].id) {
                if (this.collides(this.projectiles[laser], this.ufos[ufo])) {
                    // console.log('HIT');
                    // console.log('lasers', this.projectiles)
                    this.incrementScore(this.UFO_KILL_SCORE);
                    this.notifyUFO(this.ufos[ufo]);

                    this.projectiles[laser].explode();
                    this.projectiles[laser] = null;
                    this.projectiles = this.projectiles.filter(el => el != null);//clean up null entries caused by destroying expired ufos
                    break;
                }
            }
        }
    }
    ///NAIVE COLLISION DETECTION AMONG PROJECTILES AND PROJECTILES
    outerProjectilesLoop:
    for (let laser1 in this.projectiles) {
        for (let laser in this.projectiles) {
            if (this.projectiles[laser].owner.shipType != this.projectiles[laser1].owner.shipType) {
                if (this.collides(this.projectiles[laser], this.projectiles[laser1])) {
                    this.incrementScore(this.UFO_PROJECTILE_KILL_SCORE);
                    if (this.projectiles[laser1].owner.type == 'player') {
                        this.notifyProjectile(this.projectiles[laser]);
                        this.projectiles[laser1].explode();
                        this.projectiles[laser1] = null;
                        this.projectiles = this.projectiles.filter(el => el != null);//clean up null entries caused by destroying expired ufos
                    } else {
                        this.notifyProjectile(this.projectiles[laser1]);
                        this.projectiles[laser].explode();
                        this.projectiles[laser] = null;
                        this.projectiles = this.projectiles.filter(el => el != null);//clean up null entries caused by destroying expired ufos
                    }

                    break outerProjectilesLoop;
                }
            }
        }
    }
    ///CRUDE COLLISION DETECTION AMONG PROJECTILES AND PLAYER
    for (let laser in this.projectiles) {
        if (this.projectiles[laser].owner.shipType != 'player') {//make sure player doesn't shoot self
            if (this.collides(this.projectiles[laser], this.player)) {

                console.log('I`VE BEEN SHOT!', this.projectiles[laser])
                this.losePlayerLife();

                this.projectiles[laser] = null;
                this.projectiles = this.projectiles.filter(el => el != null);//clean up null entries caused by destroying laser
                break;
            }
        }
    }
}

MyGame.objects.GameModel.prototype.render = function () {
    if (this.gameStarted) {
        //render projectiles
        this.projectiles.forEach(function (projectile) {
            if (projectile != null) {
                projectile.render();
            }
            if (RENDER_COLLIDERS || RENDER_COLLIDERS_PROJECTILES) {
                MyGame.graphics.drawCircle({
                    center: {
                        x: projectile.center.x,
                        y: projectile.center.y
                    },
                    circum: projectile.collider[0][0].circumference
                });
            }
        });

        //render asteroids
        this.asteroids.forEach(function (asteroid) {
            if (asteroid != null) {
                asteroid.render();
                if (RENDER_COLLIDERS || RENDER_COLLIDERS_ASTEROIDS) {

                    MyGame.graphics.drawCircle({
                        center: {
                            x: asteroid.center.x,
                            y: asteroid.center.y
                        },
                        circum: asteroid.collider[0][0].circumference
                    });
                    MyGame.graphics.drawCircle({
                        center: {
                            x: asteroid.center.x,
                            y: asteroid.center.y
                        },
                        circum: 5
                    });

                    //render where the asteroid will be on wrap-around //TODO: render actual asteroid in these locations and calculate collisions there too
                    MyGame.graphics.drawCircle({
                        center: {
                            x: asteroid.center.x + GAME_SIZE_X,
                            y: asteroid.center.y
                        },
                        circum: asteroid.collider[0][0].circumference
                    });
                    MyGame.graphics.drawCircle({
                        center: {
                            x: asteroid.center.x - GAME_SIZE_X,
                            y: asteroid.center.y
                        },
                        circum: asteroid.collider[0][0].circumference
                    });
                    MyGame.graphics.drawCircle({
                        center: {
                            x: asteroid.center.x,
                            y: asteroid.center.y + GAME_SIZE_Y
                        },
                        circum: asteroid.collider[0][0].circumference
                    });
                    MyGame.graphics.drawCircle({
                        center: {
                            x: asteroid.center.x,
                            y: asteroid.center.y - GAME_SIZE_Y
                        },
                        circum: asteroid.collider[0][0].circumference
                    });
                }
            }
        });
        //render UFOs
        this.ufos.forEach(function (ufo) {
            if (ufo != null) {
                ufo.render();
                if (RENDER_COLLIDERS || RENDER_COLLIDERS_UFOS) {

                    MyGame.graphics.drawCircle({
                        center: {
                            x: ufo.center.x,
                            y: ufo.center.y
                        },
                        circum: ufo.collider[0][0].circumference
                    });
                    MyGame.graphics.drawCircle({
                        center: {
                            x: ufo.center.x,
                            y: ufo.center.y
                        },
                        circum: 5
                    });

                    //render where the ufo will be on wrap-around //TODO: render actual ufo in these locations and calculate collisions there too
                    MyGame.graphics.drawCircle({
                        center: {
                            x: ufo.center.x + GAME_SIZE_X,
                            y: ufo.center.y
                        },
                        circum: ufo.collider[0][0].circumference
                    });
                    MyGame.graphics.drawCircle({
                        center: {
                            x: ufo.center.x - GAME_SIZE_X,
                            y: ufo.center.y
                        },
                        circum: ufo.collider[0][0].circumference
                    });
                    MyGame.graphics.drawCircle({
                        center: {
                            x: ufo.center.x,
                            y: ufo.center.y + GAME_SIZE_Y
                        },
                        circum: ufo.collider[0][0].circumference
                    });
                    MyGame.graphics.drawCircle({
                        center: {
                            x: ufo.center.x,
                            y: ufo.center.y - GAME_SIZE_Y
                        },
                        circum: ufo.collider[0][0].circumference
                    });
                }
            }
        });

        if (RENDER_COLLIDERS || RENDER_COLLIDERS_PLAYER) {

            MyGame.graphics.drawCircle({//render current player respawn buffer
                center: {
                    x: this.player.center.x,
                    y: this.player.center.y
                },
                circum: this.playerSpawnBuffer * 2
            });

            MyGame.graphics.drawCircle({ //render player collider
                center: {
                    x: this.player.center.x,
                    y: this.player.center.y
                },
                circum: this.player.collider[0][0].circumference
            });

            MyGame.graphics.drawCircle({//render player respawn buffer from last attempt at random spawn point
                center: {
                    x: this.possibleLocation_x,
                    y: this.possibleLocation_y
                },
                circum: this.playerSpawnBuffer * 2
            });

        }

        if (!this.gameOver) {
            this.player.renderer.render();//render player
        }

        if (RENDER_SPAWN_POINTS) {

            this.spawnPoints.forEach(function (sp) {//render spawn points
                // console.log(asteroid)
                MyGame.graphics.drawCircle({
                    center: {
                        x: sp.x,
                        y: sp.y
                    },
                    circum: 5
                });
            });
        }
    }
}

MyGame.objects.GameModel.prototype.clearGame = function () {
    this.gameStarted = false;

    //clear projectiles
    for (let i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i] = null;
    }
    this.projectiles = [];

    //clear ufos
    for (let i = 0; i < this.ufos.length; i++) {
        this.ufos[i] = null;
    }
    this.ufos = [];

    //clear asteroids
    for (let i = 0; i < this.asteroids.length; i++) {
        this.asteroids[i] = null;
    }
    this.asteroids = [];

    //reset player
    this.player.reset();

    // MyGame.graphics.clear();

}

MyGame.objects.GameModel.prototype.newGame = function () {
    this.clearGame();
    this.gameStarted = true;

    this.nextID = 1;
    this.score = 0;
    this.level = 0;
    this.remainingLives = 2; 

}