import { LoadingScene } from "./LoadingScene.js";
import { TankGame } from "./TankGame.js";

let playGame = false;
let playButton, signinButton, registerButton, profileButton, settingsButton;


window.addEventListener("DOMContentLoaded", ()=>{
    playButton = document.getElementById('playButton');
    //assignButtons();
    main();
});

const main = async () =>{

    /*
    let loadingScene = new LoadingScene();
    loadingScene.init();
    loadingScene.animate();


    while(!playGame) {}

    delete loadingScene;
    */

    let game = new TankGame(0);    
    game.init();
    game.enableEvents();
    game.animate();
}

const assignButtons = () =>{
    playButton.addEventListener("click", PlayGame);
}

const PlayGame = () => {
    playGame = true;
    console.log("Game Starting");
}
