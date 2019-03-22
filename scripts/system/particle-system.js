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
                mean: 0.3,
                stdev: 0.05
            },
            particleLifetime: {
                mean: 1 * size / 20,
                stdev: 0.01 * size / 20
            },
            imagSrc: imgSrc,//path to image for effect
        });
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
        render: render,
        get effects() { return effects; }
    };

    return api;
};
