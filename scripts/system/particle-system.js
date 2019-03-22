// Creates a new ParticleSystem object 

MyGame.systems.ParticleSystem = function () {
    let effects = [];//array containing current particle effects

    function createExplosion(x, y, size, imgSrc) {
        let effect = new MyGame.systems.ParticleEffect({
            center: {
                x: x,
                y: y
            },
            size: {
                mean: size / 30 + 1,
                stdev: size / 50 + 1
            },
            speed: {
                // mean: 3 * size,
                // stdev: 1 * size
                mean: 300,
                stdev: 100
            },
            effectLifetime: {
                mean: 0.2 * size / 50 + 0.05,
                stdev: 0.05 * size / 50
            },
            particleLifetime: {
                mean: 1 * size / 20,
                stdev: 0.01 * size / 20
            },
            imagSrc: imgSrc,//path to image for effect
            directionRange: {
                max: 361,
                min: 0
            },
        });
        effects.push(effect);
    }

    function createExhaust(x, y, size, imgSrc, directionRange) {
        let effect = new MyGame.systems.ParticleEffect({
            center: {
                x: x,
                y: y
            },
            size: {
                mean: size / 30 ,
                stdev: size / 50
            },
            speed: {
                // mean: 3 * size,
                // stdev: 1 * size
                mean: 600,
                stdev: 100
            },
            effectLifetime: {
                mean: 0.005,
                stdev: 0.005
            },
            particleLifetime: {
                mean: 0.5 * size / 20,
                stdev: 0.01 * size / 20
            },
            imagSrc: imgSrc,//path to image for effect
            directionRange: directionRange,
        });
        // console.log(effect)
        effects.push(effect);
    }

    function update(elapsedTime) {
        // console.log(effects[0])
        for (index in effects) {
            let effect = effects[index];//syntactical sugar
            if (effect.expired) {
                effects[index] = null;//remove effect
            } else {
                effect.update(elapsedTime);
            }
        }
        effects = effects.filter(el => el != null);//clean up null entries

    }

    function render() {
        for (effect of effects) {
            effect.render();
        }
    }

    let api = {
        update: update,
        createExplosion: createExplosion,
        createExhaust: createExhaust,
        render: render,
        get effects() { return effects; }
    };

    return api;
};
