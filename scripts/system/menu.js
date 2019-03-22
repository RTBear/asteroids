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
    
    let menuElement = document.querySelector('#menu');
    // just html objects
    let menuStates = {
        main: {
            name: 'main',
            element: document.querySelector('#menu #main'),
        },//maybe have the value be the selector for the html element for that state
        newgame: {
            name: 'newgame',
            element: document.querySelector('#menu #newgame'),
        },
        pause: {
            name: 'pause',
            element: document.querySelector('#menu #pause'),
        },
        play: {
            name: 'play',
            element: document.querySelector('#menu #play'),
        },
        gameover: {
            name: 'gameover',
            element: document.querySelector('#menu #gameover'),
        },
        highscores: {
            name: 'highscores',
            element: document.querySelector('#menu #highscores'),
        },
        help: {
            name: 'help',
            element: document.querySelector('#menu #help'),
        },
        credits: {
            name: 'credits',
            element: document.querySelector('#menu #credits'),
        },
        // settings: ,
    }
    
    let currentState = menuStates.main;
    let previousState = menuStates.main;
    let currentSelection = menuStates.newgame;
    let menuStack = [menuStates.main]; //can use an array like a stack for this
    
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

    function menuEnter() {

        console.log('menuEnter');
    }

    function menuEsc() {
        console.log('menuEsc',currentState.name);//go back a level. or if during play, toggle pause screen
        if (currentState.name == 'play'){//if playing
            console.log('pause');
            previousState = currentState;
            currentState = menuStates.pause;
        } else if (currentState.name == 'pause'){//if paused
            console.log('play');
            previousState = currentState;
            currentState = menuStates.play;
        } else if (currentState.name != 'main') {//if not on main menu
            console.log('go back menu level');
            // hideElement(menuStack[menuStack.length - 1].element);
            menuStack.pop();//remove last item
            previousState = currentState;
            currentState = menuStack[menuStack.length - 1];
        }
    }

    function hideElement(el){
        el.setAttribute('style','display:none;');
    }

    function showElement(el){
        el.setAttribute('style','display:block;');
    }

    function addState(newState){
        previousState = currentState;
        menuStack.push(newState);
        currentState = newState;
    }

    function addStateByName(newStateName){
        previousState = currentState;
        menuStack.push(menuStates[newStateName]);
        currentState = menuStates[newStateName];
    }

    function showMenu(){
        if(previousState.name != currentState.name){//if there has been a change in menu state
            // console.log('p',previousState.name)
            // console.log('c',currentState.name)
            if(currentState.name == 'play'){
                hideElement(menuElement);
            }else{
                showElement(menuElement);
            }
            hideElement(previousState.element);
            showElement(currentState.element);

            previousState = currentState;//wait until state is changed
        }
    }

    let api = {
        menuUp: menuUp,
        menuRight: menuRight,
        menuDown: menuDown,
        menuLeft: menuLeft,
        menuEsc: menuEsc,
        menuEnter: menuEnter,
        addState: addState,
        addStateByName: addStateByName,
        showMenu: showMenu,
        get currentState() { return currentState; },
        get menuStates() { return currentState; },
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