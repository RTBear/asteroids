MyGame.render.SpaceObject = function (spec) {
    let image = new Image();
    let isReady = false;

    image.onload = () => {
        isReady = true;
    };
    image.src = spec.imageSrc;

    function render() {
        if (isReady) {
            // MyGame.graphics.drawTexture(image, spec.center, 2*Math.atan(spec.orientation.y/spec.orientation.x), spec.size); 
            MyGame.graphics.drawTexture(image, spec.center, Math.atan(spec.orientation.x/spec.orientation.y), spec.size); 
        }
    }

    let api = {
        render: render
    };

    return api;
};