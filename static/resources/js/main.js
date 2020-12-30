import { GameData } from "./GameData.js";
import { UIManager } from "./UIManager.js";
import { TankGame } from "./TankGame.js";

let game;
let userid = null;
let playButton, signinButton, registerButton, profileButton, settingsButton;

window.addEventListener("DOMContentLoaded", async ()=>{

    await getElements();
    assignElements();

    main();
});

const main = async () =>{
    await GameData.init();
    GameData.changeTop3Scores();
    setInterval(GameData.changeTop3Scores, 60000);
}

const getElements = async () =>{
    playButton = document.getElementById('playButton');
    signinButton = document.getElementById('signinButton');
    registerButton = document.getElementById('registerButton');
    profileButton = document.getElementById('profileButton');
    settingsButton = document.getElementById('settingsButton');

    await UIManager.init();
}

const assignElements = async () =>{
    playButton.onclick = PlayGame;
    signinButton.onclick = UIManager.showLogin;
    registerButton.onclick = UIManager.showRegister;
    profileButton.onclick = null;
    settingsButton.onclick = null;

    playButton.onmouseover = UIManager.playInteractSound;
    signinButton.onmouseover = UIManager.playInteractSound;
    registerButton.onmouseover = UIManager.playInteractSound;
    profileButton.onmouseover = UIManager.playInteractSound;
    settingsButton.onmouseover = UIManager.playInteractSound;
}

// Button Functions:
const PlayGame = async () => {
    console.log("Game Starting");
    UIManager.showGameUI();

    if(userid == null) {
        alert("Score Will not be Saved, as not Logged In");
    }

    game = new TankGame(userid);
    await game.init();
    await game.enableEvents();
    game.animate();
}