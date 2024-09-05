const ans = ["doll", "bear", "gift", "ball"];

function checkguess() {

    const g1 = document.getElementById("guess1").value.toLowerCase();
    const g2 = document.getElementById("guess2").value.toLowerCase();
    const g3 = document.getElementById("guess3").value.toLowerCase();
    const g4 = document.getElementById("guess4").value.toLowerCase();

    let score = 0;
    if (g1 === ans[0]) {
        score++;
    }
    if (g2 === ans[1]) {
        score++;
    }
    if (g3 === ans[2]) {
        score++;
    }
    if (g4 === ans[3]) {
        score++;
    }
    function displayWinMessage() {
        // Remove all elements except the header
        document.body.innerHTML = ''; // Clear everything
        let h = document.createElement('h1'); // Create a new header element
        h.textContent = 'HURRAY!! YOU WON!';
        h.style.color = 'black';
        h.style.textAlign = 'center';
        h.style.justifyContent='center;'
        document.body.appendChild(h); 
        
    }

    const result = document.getElementById('result');

    if (score === 4) {
        displayWinMessage()

    } else {
        result.textContent = `You got ${score} out of 4 correct. Try again!`;
        result.style.color = "red";
    }
}
document.getElementById("but").addEventListener("click", checkguess);
