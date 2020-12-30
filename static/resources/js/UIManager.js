class UIManager {

    constructor() {

    }

    static windows = {
        "MenuUI": null,
        "GameUI": null,

        "LoginRegister": null,
        "LoginRegisterSeperators": [null,null]
    };

    static init = async () => {
        this.windows.MenuUI = document.getElementById("menuUIContainer"); // Navbar
        this.windows.GameUI = document.getElementById("gameUIContainer"); // Game UI

        this.windows.LoginRegister = document.getElementById("logregDiv"); // Main Outer Div
        this.windows.LoginRegisterSeperators[0] = document.getElementById("loginSepDiv"); // Login Div Section
        this.windows.LoginRegisterSeperators[1] = document.getElementById("registerSepDiv"); // Register Div
    };

    static showMenuUI = () => {
        this.windows.MenuUI.hidden = false;
        this.windows.GameUI.hidden = true;
    }

    static showGameUI = () => {
        this.windows.GameUI.hidden = false;
        this.windows.MenuUI.hidden = true;
    };

    static showFinishedGameUI = () =>{
        this.windows.MenuUI.hidden = false;        
        this.windows.GameUI.hidden = true;
    }

    static showLogin = () => {
        if(!this.windows.LoginRegisterSeperators[0].hidden){
            this.windows.LoginRegister.hidden.hidden = true;
        } else{
            this.windows.LoginRegisterSeperators[0].hidden = false;
            this.windows.LoginRegisterSeperators[1].hidden = true;            
        }
    }

    static showRegister = () =>{
        this.windows.LoginRegisterSeperators[0].hidden = true;
        this.windows.LoginRegisterSeperators[1].hidden = false;
    }

    static playInteractSound = () =>{
        let interactSound = new Audio("../sounds/interactsound.wav");
        if(interactSound != null){
            interactSound.currentTime = 0;
            interactSound.play();  
        }
    }
}

export { UIManager }