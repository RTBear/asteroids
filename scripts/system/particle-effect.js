// Creates a new ParticleEffect object based on specification (spec)

//------------------------------------------------------------------
//
//  spec = {
//     center: { x: , y: },
//     size: { mean: , stdev:  },
//     speed: { mean: , stdev:  },
//     effectLifetime: { mean: , stdev:  },
//     particleLifetime: { mean: , stdev:  },
//     imagSrc: ,//path to image for effect
//     direction: ,//direction range to fire particles in
// }
//
//------------------------------------------------------------------

MyGame.systems.ParticleEffect = function (spec) {
    let nextName = 1;
    let particles = {};
    let expired = false;
    let effectRunTime = 0;

    let effectLifetime = Random.nextGaussian(spec.effectLifetime.mean, spec.effectLifetime.stdev); // seconds



    let renderer = MyGame.render.ParticleEffect(particles, MyGame.graphics, spec.imagSrc);

    function render(){
        renderer.render();
    }

    function create() {
        let size = Random.nextGaussian(spec.size.mean, spec.size.stdev);
        let angle = Random.nextRange(spec.directionRange.min,spec.directionRange.max) * Math.PI / 180;//range in degrees... convert to direction in radians
        let p = {
            center: { x: spec.center.x, y: spec.center.y },
            size: { x: size, y: size },
            direction: { x: Math.cos(angle), y: Math.sin(angle) },
            speed: Random.nextGaussian(spec.speed.mean, spec.speed.stdev), // pixels per second
            rotation: 0,
            particleLifetime: Random.nextGaussian(spec.particleLifetime.mean, spec.particleLifetime.stdev), // seconds
            alive: 0
        };

        return p;
    }

    function update(elapsedTime) {
        let removeMe = [];
        // console.log(effectRunTime, effectLifetime);
        if(effectRunTime >= effectLifetime){
            expireEffect();
        }
        elapsedTime = elapsedTime / 1000;//convert from ms to seconds
        effectRunTime += elapsedTime;


        for (let particle = 0; particle < 2; particle++) {
            particles[nextName++] = create();
        }

        Object.getOwnPropertyNames(particles).forEach(value => {
            let particle = particles[value];

            particle.alive += elapsedTime;
            particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
            particle.center.y += (elapsedTime * particle.speed * particle.direction.y);

            particle.rotation += particle.speed / 500;

            if (particle.alive > particle.particleLifetime) {
                removeMe.push(value);
            }
        });

        for (let particle = 0; particle < removeMe.length; particle++) {
            delete particles[removeMe[particle]];
        }
    }

    function expireEffect(){
        expired = true;
    }

    let api = {
        update: update,
        render: render,
        get particles() { return particles; },
        get expired() { return expired; },
    };

    return api;
};
