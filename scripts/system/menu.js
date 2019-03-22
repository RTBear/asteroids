//------------------------------------------------------------------
// Creates a new Menu object
// options are as follows:
// 
//                       |- pause
//          |- newgame --|- play <display no menu>
//          |- highscores
//  main----|- help (display controls and instructions)
//          |- credits
//          |- settings (TODO: not-assigned but would include things like sound settings/volume, maybe choose controls)
// 
//------------------------------------------------------------------

MyGame.systems.Menu = function () {
    'use strict';
    let menuStack = []; //can use an array like a stack for this

    // just html objects
    let menuStates = {
        main: {
            element: document.querySelector('#menu #main'),
        },//maybe have the value be the selector for the html element for that state
        newgame: {
            element: document.querySelector('#menu #newgame'),
            pause: {
                element: document.querySelector('#menu #newgame #pause'),
            },
            play: {
                element: document.querySelector('#menu #newgame #play'),
            },
            gameover: {
                element: document.querySelector('#menu #newgame #gameover'),
            },
        },
        highscores: false,
        help: false,
        credits: false,
        // settings: false,
    }

    let currentState = menuStates.main;

    function menuUp() {
        console.log('menuUp');
    }

    function menuRight() {
        console.log('menuRight');

    }

    function menuDown() {
        console.log('menuDown');

    }

    function menuLeft() {

        console.log('menuLeft');
    }

    function menuEsc() {

        console.log('menuEsc');//go back a level. or if during play, toggle pause screen
    }

    let api = {
        menuUp: menuUp,
        menuRight: menuRight,
        menuDown: menuDown,
        menuLeft: menuLeft,
        menuEsc: menuEsc,
        get currentState() { return currentState; },
    };

    return api;
};

// //------------------------------------------------------------------
// // Creates a new Menu object
// // options are as follows:
// // 
// //                       |- pause
// //          |- newgame --|- play <display no menu>
// //          |- highscores
// //  main----|- help (display controls and instructions)
// //          |- credits
// //          |- settings (TODO: not-assigned but would include things like sound settings/volume, maybe choose controls)
// // 
// //------------------------------------------------------------------

// MyGame.systems.Menu = function () {
//     'use strict';

//     this.menuStack = []; //can use an array like a stack for this

//     // just html objects
//     this.menuStates = {
//         main: {
//             element: document.querySelector('#menu #main'),
//         },//maybe have the value be the selector for the html element for that state
//         newgame: {
//             element: document.querySelector('#menu #newgame'),
//             pause: {
//                 element: document.querySelector('#menu #newgame #pause'),
//             },
//             play: {
//                 element: document.querySelector('#menu #newgame #play'),
//             },
//             gameover: {
//                 element: document.querySelector('#menu #newgame #gameover'),
//             },
//         },
//         highscores: false,
//         help: false,
//         credits: false,
//         // settings: false,
//     }

//     this.currentState = this.menuStates.main;

    
//     // let api = {
//     //     menuUp: menuUp,
//     //     menuRight: menuRight,
//     //     menuDown: menuDown,
//     //     menuLeft: menuLeft,
//     //     get currentState() { return currentState; },
//     // };
    
//     // return api;
// };

// MyGame.systems.Menu.prototype.newState = function(state) {
//     console.log('newState');//may not need this function
// }

// MyGame.systems.Menu.prototype.menuUp = function() {
//     console.log('menuUp');
// }

// MyGame.systems.Menu.prototype.menuRight = function() {
//     console.log('menuRight');

// }

// MyGame.systems.Menu.prototype.menuDown = function() {
//     console.log('menuDown');

// }

// MyGame.systems.Menu.prototype.menuLeft = function() {

//     console.log('menuLeft');
// }

// MyGame.systems.Menu.prototype.menuEsc = function() {

//     console.log('menuEsc');//go back a level. or if during play, toggle pause screen
// }