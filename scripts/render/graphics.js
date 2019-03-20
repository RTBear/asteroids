MyGame.graphics = (function() {
    'use strict';

    let canvas = document.getElementById('game-canvas');
    let context = canvas.getContext('2d');

    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // --------------------------------------------------------------
    //
    // Draws a texture to the canvas with the following specification:
    //    image: Image
    //    center: {x: , y: }
    //    size: { width: , height: }
    //
    // --------------------------------------------------------------
    function drawTexture(image, center, rotation, size) {
        context.save();

        context.translate(center.x, center.y);
        context.rotate(rotation);
        context.translate(-center.x, -center.y);

        context.drawImage(
            image,
            center.x - size.x / 2,
            center.y - size.y / 2,
            size.x, size.y);

        context.restore();
    }

    // --------------------------------------------------------------
    //
    // Draw a rectangle to the canvas with the following attributes:
    //      center: { x: , y: },
    //      size: { x: , y: },
    //      rotation:       // radians
    //
    // --------------------------------------------------------------
    function drawRectangle(rect, fillStyle, strokeStyle) {
        context.save();
        context.translate(rect.center.x, rect.center.y );
        context.rotate(rect.rotation);
        context.translate(-rect.center.x, -rect.center.y);
        
        context.fillStyle = fillStyle;
        context.fillRect(rect.center.x - rect.size.x / 2, rect.center.y - rect.size.y / 2, rect.size.x, rect.size.y);
        
        context.strokeStyle = strokeStyle;
        context.strokeRect(rect.center.x - rect.size.x / 2, rect.center.y - rect.size.y / 2, rect.size.x, rect.size.y);

        context.restore();
    }

    // --------------------------------------------------------------
    //
    // Draw a circle to the canvas with the following attributes:
    //      center: { x: , y: },
    //      radius: ,//float
    //
    // --------------------------------------------------------------
    function drawCircle(circ, fillStyle, strokeStyle) {
        context.save();
        // context.translate(circ.center.x, circ.center.y );
        // context.translate(-circ.center.x, -circ.center.y);
        
        // context.fillStyle = fillStyle;
        // context.fillRect(circ.center.x - circ.size.x / 2, circ.center.y - circ.size.y / 2, circ.size.x, circ.size.y);
        
        // context.strokeStyle = strokeStyle;
        // context.strokeRect(circ.center.x - circ.size.x / 2, circ.center.y - circ.size.y / 2, circ.size.x, circ.size.y);
        context.strokeStyle = "#f4f442";
        drawEllipseByCenter(circ.center.x, circ.center.y, circ.radius, circ.radius);
        context.restore();
    }

    function drawEllipseByCenter(cx, cy, w, h) {// credit to Steve Tranby (https://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas)
        drawEllipse(cx - w/2.0, cy - h/2.0, w, h);
      }
      
      function drawEllipse(x, y, w, h) {
        var kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle
      
        context.beginPath();
        context.moveTo(x, ym);
        context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        context.closePath();
        context.stroke();
      }

    let api = {
        clear: clear,
        drawTexture: drawTexture,
        drawRectangle: drawRectangle,
        drawCircle: drawCircle,
    };

    return api;
}());
