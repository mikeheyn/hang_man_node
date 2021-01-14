/*

A couple of things you'll notice:

NAMING CONVENTIONS:
* I capitalize my functions because it's more readable.
* For variables I use underscore casing
* For constants and enums I use ALL CAPS

The industry standard for JS sucks but I'll use it if I have to.

I chose not to use typescript because I want to get this done fast and boilerplate doesn't accomplish that.

*/

// GREAT library I've used before. It'll speed up dev time.
var inquirer = require('inquirer');

// https://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
// Stack overflow KungFu, don't act like you don't
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}


/*
DATA STRUCTURE ENUMS
*/

const GAME_STATES = {
    INIT: 1,
    PLAY: 2,
    WON: 3,
    LOST: 4
}

/*
GAME CLASS
*/

class HangManGame
{
    constructor() {
        this.Init();
        this.GameStep();
    }

    Init()
    {
        this.lives = 6;
        this.STATE = GAME_STATES.INIT;
        this.drawings = require('./config/drawings');
        this.letters_selected = [];
    }

    // I like to capitalize my functions despite JS's ugly standard
    async GameStep() {
        switch(this.STATE)
        {            
            case GAME_STATES.INIT:
                console.clear();
                console.log("Welcome to Mike's Hangman");
                this.PrintDrawing();
                await this.InitGame();
            break;
            case GAME_STATES.PLAY:
                console.clear();
                console.log("Playing Mike's Hangman");
                console.log("WORD: " + this.ObfuscatedWord());
                this.PrintGuessed();
                console.log("Limbs remaining: " + this.lives);
                this.PrintDrawing();

                await this.GameRound();
            break;
            case GAME_STATES.WON:
            case GAME_STATES.LOST:
                if(this.STATE == GAME_STATES.WON)
                {
                    console.log("YOU WON!");
                }
                else
                {
                    console.log("YOU LOST :(")
                }
                this.PrintDrawing();
                console.log("The word was: " + this.word);

                let answer = await inquirer.prompt({
                    type: 'list',
                    message: 'Play again?',
                    name: 'cb',
                    choices: [
                        {
                            name: 'Yes'
                        },
                        {
                            name: 'No'
                        }
                    ]
                })

                if(answer.cb == 'Yes')
                {
                    this.Init();
                    this.STATE = GAME_STATES.INIT;
                }
                else
                {
                    process.exit(0);
                }
            break;
        }

        this.GameStep();
    }

    PrintGuessed()
    {
        let superInefficientImmutableStringReassignment = "";
        for(let i = 0; i < this.letters_selected.length; i++)
        {
            superInefficientImmutableStringReassignment += this.letters_selected[i] + " ";
        }
        console.log("GUESSED: " + superInefficientImmutableStringReassignment);
    }

    async InitGame()
    {
        let answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'wl',
                message: "What's the maximum word length you'd like to play with?"
            },
            {
                type: 'input',
                name: 'dictionary',
                message: "What's the name of the dictionary file you'd like to load?"
            }
        ])

        if (!Number.isInteger(answers.wl))
        {
            console.log("As a punishment for your prodding into whether or not I took the time to do annoying type checking, you are hereby expelled from the school of magic Harry.");
            process.exit(1);
        }

        this.word_length_max = answers.wl;
        this.dictionary = require(`./dictionaries/${answers.dictionary}`).filter(words => words.length <= this.word_length_max);
        this.word = this.dictionary[Math.floor(Math.random() * parseInt(this.dictionary.length))];
        
        console.log("DEBUG: WORD SELECTED: " + this.word);

        this.STATE = GAME_STATES.PLAY;
    }

    async GameRound()
    {
        let answer = await inquirer.prompt({
            type: 'input',
            name: 'letter',
            message: "Guess a letter"
        })

        if(answer.letter.length != 1) {
            console.log("Only one letter!");
            return;
        }

        if(!this.word.includes(answer.letter[0]))
            this.lives--;

        this.letters_selected.push(answer.letter[0]);
        this.CheckWinLossConditions();
    }

    async GameOver()
    {

    }

    async PrintDrawing()
    {
        console.log(this.drawings[6 - this.lives]);
    }

    ObfuscatedWord()
    {
        let displayWord = this.word;
        // word length is * 2 to compensate for the modulo below
        for(let i = 0; i < this.word.length*2; i++)
        {
            if(!this.letters_selected.includes(displayWord[i]))
            {
                displayWord = displayWord.replaceAt(i, '_');
            }

            if(i % 2 == 0)
            {
                displayWord = displayWord.slice(0, i) + " " + displayWord.slice(i);
            }
        }

        return displayWord;
    }

    CheckWinLossConditions()
    {
        console.log(this.lives);
        if(this.lives == 0)
        {
            this.STATE = GAME_STATES.LOST;
        }

        let word = this.ObfuscatedWord();
        if(!word.includes('_'))
        {
            this.STATE = GAME_STATES.WON;
        }
    }
}

new HangManGame();


process.on('uncaughtException', err => {
    console.error('There was an uncaught error', err)
    process.exit(1) //mandatory (as per the Node.js docs)
})