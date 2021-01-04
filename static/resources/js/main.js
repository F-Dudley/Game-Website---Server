import { TankGame } from "./TankGame.js";

import { GameData } from "./GameData.js";
import { UIManager } from "./UIManager.js";

let game;
let userid = null;
// Navbar Buttons
let nav_PlayButton, nav_SigninButton, nav_RegisterButton, nav_ProfileButton, nav_SettingsButton;

// Input Fields
let LoginInput_Username, LoginInput_Password, LoginInput_Button;
let RegisterInput_Username, RegisterInput_Email, RegisterInput_Password, RegisterInput_Button;

// General Audio
let interactSound;

window.addEventListener("DOMContentLoaded", async ()=>{
    await getElements();

    main();
});

const main = async () =>{
    await GameData.init();
    await assignElements();

    GameData.changeTop3Scores();
    setInterval(GameData.changeTop3Scores, 60000);
}

const getElements = async () =>{
    interactSound = document.getElementById('sound_interact');

    //Navbar Buttons
    nav_PlayButton = document.getElementById('nav_playButton');
    nav_SigninButton = document.getElementById('nav_signinButton');
    nav_RegisterButton = document.getElementById('nav_registerButton');
    nav_ProfileButton = document.getElementById('nav_profileButton');

    //Login Input Fields
    LoginInput_Username = document.getElementById('LoginInput_username');
    LoginInput_Password = document.getElementById('LoginInput_password');
    LoginInput_Button = document.getElementById('LoginInput_button');

    //Register Input Fields
    RegisterInput_Username = document.getElementById('RegisterInput_username');
    RegisterInput_Email = document.getElementById('RegisterInput_email');
    RegisterInput_Password = document.getElementById('RegisterInput_password');
    RegisterInput_Button = document.getElementById('RegisterInput_button');

    await UIManager.init();
}

const assignElements = async () =>{
    // Navbar Buttons
    nav_PlayButton.onclick = PlayGame;
    nav_SigninButton.onclick = UIManager.showLogin;
    nav_RegisterButton.onclick = UIManager.showRegister;
    nav_ProfileButton.onclick = null;

    nav_PlayButton.onmouseover = playInteractSound;
    nav_SigninButton.onmouseover = playInteractSound;
    nav_RegisterButton.onmouseover = playInteractSound;
    nav_ProfileButton.onmouseover = playInteractSound;

    // Login Input Fields
    LoginInput_Button.onclick = SignInPlayer;

    LoginInput_Username.onfocus = playInteractSound;
    LoginInput_Password.onfocus = playInteractSound;
    LoginInput_Button.onmouseover = playInteractSound;
    
    // Register Input Fields
    RegisterInput_Button.onclick = RegisterPlayer;

    RegisterInput_Username.onfocus = playInteractSound;
    RegisterInput_Email.onfocus = playInteractSound;
    RegisterInput_Password.onfocus = playInteractSound;
    RegisterInput_Button.onmouseover = playInteractSound;

    UIManager.windows.GameReturnButton.onclick = UIManager.showMenuUI;
}

// Button Functions:
const PlayGame = async () => {
    console.log("Game Starting");
    UIManager.showGameUI();
    
    if(userid == null) {
        alert("Score Will not be Saved, as not Logged In");
    }

    game = new TankGame(userid);

    await game.init(userid);
    await game.enableEvents();
    game.animate();
}

const SignInPlayer = async () => {
    let username = LoginInput_Username.value;
    let password = LoginInput_Password.value;

    let data = await GameData.getGameData(`checkuser-${username}/${password}`);
    if(data == null){
        alert(`User: ${username} not found`);
        LoginInput_Username.focus();
        LoginInput_Password.value = "";
    }
    else if(data.length > 0){
        alert("Logged In as User: " + data[0].username);
        userid = data[0].id;
        UIManager.hideLogRegUI();
    }
}

const RegisterPlayer = async () => {
    let username = RegisterInput_Username.value;
    let email = RegisterInput_Email.value;
    let password = RegisterInput_Password.value;
    
    let data = await GameData.getGameData(`checkuser-${username}`);
    if(data == null){
        await GameData.editGameData(`adduser/${username}-${email}/${password}`);

        RegisterInput_Username.value = "";
        RegisterInput_Email.value = "";
        RegisterInput_Password = "";
        alert("User Added");

        UIManager.showLogin();
        LoginInput_Username.value = username;
        LoginInput_Password.focus();
    }
    else if(data.length > 0){
        alert("Username Taken, Try Again");

        RegisterInput_Username.focus();
        RegisterInput_Password.value = "";
    }
}

const playInteractSound = () => {
    interactSound.currentTime = 0;
    interactSound.play();
}