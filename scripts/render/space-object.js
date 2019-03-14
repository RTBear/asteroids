MyGame.render.SpaceObject = function (spec) {
    let image = new Image();
    let isReady = false;

    image.onload = () => {
        isReady = true;
    };
    image.src = spec.imageSrc;

    function render() {
        if (isReady) {
            MyGame.graphics.drawTexture(image, spec.center, spec.rotation.value, spec.size); 
        }
    }

    let api = {
        render: render
    };

    return api;
};