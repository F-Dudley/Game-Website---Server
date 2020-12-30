class GameData {

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
        console.log(`Gettings Data from: http://localhost:3000/${_directory}`);
        try {
            let res = await fetch(`http://localhost:3000/${_directory}`);
            let data = await res.json();

            console.log(data);
            return data;

        } catch (error) {
            console.log(`Error Getting Data: ${error}`);
        }
    }

    static editGameData = async (_directory) => {
        console.log(`Getting Data from: http://localhost:3000/${_directory}`);
        try {

            let res = await fetch(`http://localhost:3000/${_directory}`);
            console.log(res.text());

        } catch (error) {
            console.log(`Error Editting Data: ${error}`);
        }
    }

    static changeTop3Scores = async () => {
        console.log("Changing Top 3 Highscores");

        let data = await this.getGameData('top3scores');
        // 1st Place Elements
        this.top1UsernameElement.innerHTML = data[0].username;
        this.top1ScoreElement.innerHTML = data[0].highscore;
        // 2nd Place Elements
        this.top2UsernameElement.innerHTML = data[1].username;
        this.top2ScoreElement.innerHTML = data[1].highscore;
        // 3rd Place Elements
        this.top3UsernameElement.innerHTML = data[2].username;
        this.top3ScoreElement.innerHTML = data[2].highscore;
    }
}

export { GameData };