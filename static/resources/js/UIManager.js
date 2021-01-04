export class UIManager {

    constructor() {

    }

    static windows = {
        "MenuUI": null,
        "GameUI": null,

        "Navbar": null,

        "LoginRegister": null,
        "LoginRegisterSeperators": [null,null],

        "GameHealthLabel": null,
        "GameScoreLabel": null,
        "GameReturnButton": null
    };

    static init = async () => {
        this.windows.MenuUI = document.getElementById("menuUIContainer"); // Navbar
        this.windows.GameUI = document.getElementById("gameUIContainer"); // Game UI

        this.windows.Navbar = document.getElementById("navbarDiv");

        this.windows.LoginRegister = document.getElementById("logregDiv"); // Main Outer Div
        this.windows.LoginRegisterSeperators[0] = document.getElementById("loginSepDiv"); // Login Div Section
        this.windows.LoginRegisterSeperators[1] = document.getElementById("registerSepDiv"); // Register Div

        this.windows.GameHealthLabel = document.getElementById("labelHealthUI");
        this.windows.GameScoreLabel = document.getElementById("labelScoreUI");   
        this.windows.GameReturnButton = document.getElementById("gameReturnButton");
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
        this.windows.GameHealthLabel.innerHTML = "";
        this.windows.GameScoreLabel.innerHTML = "";

        this.windows.MenuUI.hidden = false;        
        this.windows.GameUI.hidden = true;
    }

    static hideLogRegUI = () => {
        this.windows.Navbar.removeChild(document.getElementById("nav_signinButton"));
        this.windows.Navbar.removeChild(document.getElementById("nav_registerButton"));
        this.windows.LoginRegister.hidden = true;
    }

    static showLogin = () => {
        if(this.windows.LoginRegister.hidden){
            this.windows.LoginRegister.hidden = false;    
        }
        else if(!this.windows.LoginRegisterSeperators[0].hidden){
            this.windows.LoginRegister.hidden = true;
        } 

        this.windows.LoginRegisterSeperators[0].hidden = false;
        this.windows.LoginRegisterSeperators[1].hidden = true;
    }

    static showRegister = () =>{
        if(this.windows.LoginRegister.hidden){
            this.windows.LoginRegister.hidden = false;    
        }
        else if(!this.windows.LoginRegisterSeperators[1].hidden){
            this.windows.LoginRegister.hidden = true;
        } 

        this.windows.LoginRegisterSeperators[0].hidden = true;
        this.windows.LoginRegisterSeperators[1].hidden = false;
    }

    static setGameValues = (_health, _score) => {
        this.windows.GameHealthLabel.innerHTML = "Health: " + _health;
        this.windows.GameScoreLabel.innerHTML = "Score: " + _score;
    }   
}