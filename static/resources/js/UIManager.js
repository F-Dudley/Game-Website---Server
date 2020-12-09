
var gameUIDiv;
var navbarDiv, logregDiv;
var loginSepDiv, registerSepDiv;

window.addEventListener("DOMContentLoaded", ()=>{

    //UI 
    gameUIDiv = document.getElementById("gameUIDiv"); // Game UI
    navbarDiv = document.getElementById("navbarDiv"); // Navbar

    logregDiv = document.getElementById("logregDiv"); // Main Outer Div
    loginSepDiv = document.getElementById("loginSepDiv"); // Login Div Section
    registerSepDiv = document.getElementById("registerSepDiv"); // Register Div
});

const interactSound = new Audio('../sounds/interactsound.wav');
const playInteractSound = () =>{
    if(interactSound != null){
        interactSound.currentTime = 0;
        interactSound.play();  
    }
}

// TEMP FOR DEMO PURPOSES
const showLoginDiv = () =>{ 
    logregDiv.hidden = false;
    loginSepDiv.hidden = false;

    registerSepDiv.hidden = true;
};
const showRegisterDiv = () =>{
    logregDiv.hidden = false;
    registerSepDiv.hidden = false;

    loginSepDiv.hidden = true;
}
const hidePages = () =>{
    navbarDiv.hidden = true;
    logregDiv.hidden = true;
    gameUIDiv.hidden = false;
}