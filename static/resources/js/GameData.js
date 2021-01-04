export class GameData {

    constructor() {

    }

    static top1UsernameElement; static top1ScoreElement;
    static top2UsernameElement; static top2ScoreElement;
    static top3UsernameElement; static top3ScoreElement;

    static init = async () => {
        // Get all the Elements to insert data into.
        this.top1UsernameElement = document.getElementById("highscore1User");
        this.top1ScoreElement = document.getElementById("highscore1Score");

        this.top2UsernameElement = document.getElementById("highscore2User");
        this.top2ScoreElement = document.getElementById("highscore2Score");

        this.top3UsernameElement = document.getElementById("highscore3User");
        this.top3ScoreElement = document.getElementById("highscore3Score");
    }

    static getGameData = async (_directory) => {
        try {
            let res = await fetch(`http://localhost:3000/${_directory}`);
            if(res != null){
                let data = await res.json();
                return data
            }
            
            return res;
        } 
        catch (error) {
            console.log(`Error Getting Data: ${error}`);
        }
    }

    static editGameData = async (_directory) => {
        try {
            let res = await fetch(`http://localhost:3000/${_directory}`);
        }
        catch (error) {
            console.log(`Error Editting Data: ${error}`);
        }
    }

    static changeTop3Scores = async () => {
        let data = await this.getGameData('top3scores');
        if(data[0] != undefined && data[1] != undefined && data[2] != undefined)
        {
            // 1st Place Elements
            if(this.top1UsernameElement != undefined && this.top2ScoreElement != undefined){
                this.top1UsernameElement.innerHTML = data[0].username;
                this.top1ScoreElement.innerHTML = data[0].highscore;            
            }

            // 2nd Place Elements
            if(this.top2UsernameElement != undefined && this.top2ScoreElement != undefined){
                this.top2UsernameElement.innerHTML = data[1].username;
                this.top2ScoreElement.innerHTML = data[1].highscore;            
            }

            // 3rd Place Elements
            if(this.top3UsernameElement != undefined && this.top3ScoreElement != undefined){
                this.top3UsernameElement.innerHTML = data[2].username;
                this.top3ScoreElement.innerHTML = data[2].highscore;            
            }            
        }
    }
}