/*
 * NPC: Fa Hai (Henesys)
 * ID: 9300001
 * Couple Trivia Quiz
 * @item 5010024
 */

var status = 0;
var correctAnswers = 0;
var currentQuestion = 0;
var rewardItemId = 5010024; // Following Ducks
var questions = [
    {
        question: "When was our first date?",
        options: ["A) 18.4.22", "B) 24.5.22", "C) 6.5.22", "D) 12.4.22"],
        correct: 0 // A) 18.4.22
    },
    {
        // which restaurant did we go to on our first date?
        question: "Which restaurant serve the best Crack-Pie?",
        options: ["A) Aresto", "B) Port Cafe", "C) Hellana", "D) Bistro Fleur"],
        correct: 1 // B) Port Cafe
    },
    {
        question: "Which book is the best?",
        options: ["A) Wrong", "B) WRONG", "C) Harry Potter", "D) WrOnG!"],
        correct: 2 // C) Harry Potter
    },
    {
        // what is the best neighborhood in MapleStory?
        question: "What is the best neighborhood in the world?",
        options: ["A) Giv'at Ya'ara", "B) Granada Hills", "C) Mishav", "D) Henesys"],
        correct: 1 // B) Granada Hills
    },
    {
        question: "In which country is throwing dishes at the couple’s home a wedding tradition?",
        options: ["A) California, New Mexico, Utah, Nevada", "B) California, Arizona, Utah, Colorado", "C) Calizona, Arivada, Uton, Nevadaska", "D) California, Arizona, Utah, Nevada"],
        correct: 3 // D) California, Arizona, Utah, Nevada
    },
    {
        question: "How many days your husband did Milluim?",
        options: ["A) ~250", "B) ~280", "C) ~134", "D) ~80"],
        correct: 1 // B) Rose
    },
    {
        question: "Why can't we do a puzzle together?",
        options: ["A) It’ll start a war", "B) Time loop initiated", "C) Bees... just bees", "D) Major Tsunami"],
        correct: 0 // A) It’ll start a war
    },
    {
        question: "How many guests were at our wedding?",
        options: ["A) 292 ", "B) 302", "C) 286", "D) 271"],
        correct: 2 // C) 286
    },
    {
        question: "Which car did we rented in our road-trip?",
        options: ["A) Toyota RAV4", "B) Ford Escape", "C) Honda CR-V", "D) Nissan Rogue"],
        correct: 1 // B) Ford Escape
    },
    {
        question: "How many kids do YOU want?",
        options: ["A) ->", "B) 9", "C) <-", "D) <-<-"],
        correct: 1 // B) June
    }
];

// answers = [0, 1, 1, 1, 0, 1, 0, 2, 1, 1]; // Correct answers for the questions

function start() {
    status = -1;
    correctAnswers = 0; // Reset correct answers at the start
    currentQuestion = 0; // Reset question index at the start
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1 || (mode == 0 && status == 0)) {
        cm.sendOk("Come back when you're ready to take the Talihoo Trivia Quiz!");
        cm.dispose();
        return;
    }
    if (mode == 1) {
        status++;
    } else {
        status--;
    }

    if (status == 0) {
        cm.sendNext("Welcome to the Talihoo Trivia Quiz! Answer all 10 questions correctly to win a #dSECRET PRIZE.#k One wrong answer and you'll have to start over. Let's begin!");
    } else if (status == 1) {
        // Ask the current question
        var questionText = questions[currentQuestion].question + "\r\n";
        for (var i = 0; i < questions[currentQuestion].options.length; i++) {
            questionText += "#L" + i + "#" + questions[currentQuestion].options[i] + "#l\r\n";
        }
        cm.sendSimple(questionText);
    } else if (status == 2) {
        if (selection != questions[currentQuestion].correct) {
            cm.sendOk("Sorry, that's incorrect. You need to answer all questions correctly to win. Talk to me again to retry from the start!");
            cm.dispose();
            return;
        }
        correctAnswers++;
        currentQuestion++;
        if (currentQuestion >= questions.length) {
            // All questions answered, check for reward
            if (correctAnswers == questions.length) {
                if (cm.canHold(rewardItemId, 1)) {
                    cm.gainItem(rewardItemId, 1);
                    cm.sendOk("Congratulations! You answered all 10 questions correctly! Here's your secret prize, check CASH tab.");
                } else {
                    cm.sendOk("You answered all questions correctly, but your CASH inventory is full. Please make space and try again!");
                }
            } else {
                cm.sendOk("You got a question wrong and need to start over. Talk to me again to retry the quiz!");
            }
            cm.dispose();
        } else {
            // Ask the next question
            var questionText = questions[currentQuestion].question + "\r\n";
            for (var i = 0; i < questions[currentQuestion].options.length; i++) {
                questionText += "#L" + i + "#" + questions[currentQuestion].options[i] + "#l\r\n";
            }
            cm.sendSimple(questionText);
            status = 1; // Loop back to handle the next answer
        }
    }
}