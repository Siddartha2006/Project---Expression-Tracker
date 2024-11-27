const answers = ["doll", "bear", "gift", "ball"];
let userGuesses = ["", "", "", ""];

document.querySelectorAll(".option").forEach(button => {
    button.addEventListener("click", function() {
        const wordIndex = button.getAttribute("data-word");

        document.querySelectorAll(`button[data-word="${wordIndex}"]`).forEach(opt => {
            opt.classList.remove("selected");
        });

        button.classList.add("selected");
        userGuesses[wordIndex] = button.textContent.toLowerCase(); // Update user's guess
    });
});


function displayWinMessage() {
    const overlay = document.createElement("div");
    overlay.id = "winOverlay";
    overlay.innerHTML = "<h1>HURRAY!! YOU WON!</h1>";
    document.body.appendChild(overlay);
}

// Check answers and show overlay if correct
function checkAnswers() {
    let score = 0;
    answers.forEach((answer, index) => {
        if (userGuesses[index] === answer) {
            score++;
        }
    });

    if (score === 4) {
        displayWinMessage();
    } else {
        const result = document.getElementById('result');
        result.textContent = `You got ${score} out of 4 correct. Try again!`;
        result.style.color = "red";
    }
}

document.getElementById("capture").addEventListener("click", checkAnswers);
