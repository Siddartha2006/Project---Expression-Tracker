const images = [
    { src: 'image1.jpg', answer: 'apple' },
    { src: 'pen.jpg', answer: 'pen' },
    { src: 'hen.jpg', answer: 'hen' },
    { src: 'car1.jpeg', answer: 'car' },
    { src: 'grapes.jpg', answer: 'grapes' },
    { src: 'Cat_March_2010-1a.jpg', answer: 'cat' },
];

let currentIndex = 0;
let score = 0;
let speech = new SpeechSynthesisUtterance();

function loadNewImage() {
    if (currentIndex < images.length) {
        const currentImage = images[currentIndex];
        document.getElementById('image').src = currentImage.src;
        document.getElementById('guess-input').value = '';
        document.getElementById('result-message').textContent = '';
        //document.getElementById('next-image').style.display = 'none';
    } else {
        displayWinMessage();
    }
}

function displayWinMessage() {

    document.body.innerHTML = '';
    let h = document.createElement('h1'); 
    h.textContent = 'HURRAY!! YOU WON!';
    h.style.color = 'green';
    h.style.textAlign = 'center'; 
    document.body.appendChild(h); 
    
}


document.getElementById('submit-guess').addEventListener('click', function () {
    const userGuess = document.getElementById('guess-input').value.toLowerCase();
    const correctAnswer = images[currentIndex].answer.toLowerCase();
    speech.text = document.getElementById('guess-input').value;
    window.speechSynthesis.cancel(); 
    window.speechSynthesis.speak(speech);
    
    if (userGuess === correctAnswer) {
        speech.text = 'Correct!'
        window.speechSynthesis.speak(speech);

        h=document.getElementById('result-message');
        h.textContent = 'Correct!';
        h.style.color='green';
        score++;
        //document.getElementById('next7-image').style.display = 'inline';
        currentIndex++;
        document.getElementById('score').textContent = `SCORE: ${score}/${images.length}`;
        
        if (currentIndex == images.length) {
            displayWinMessage(); // Display win message if all images have been guessed
            speech.text = 'HURRAY!! YOU WON!'
            //window.speechSynthesis.cancel(); // Stop any ongoing speech
            window.speechSynthesis.speak(speech);
        } else {
            setTimeout(loadNewImage, 2500);
        }
    } else {
        speech.text = 'Try again!'
        window.speechSynthesis.speak(speech);
        document.getElementById('result-message').textContent = 'Try again!';
        document.getElementById('score').textContent = `SCORE: ${score}/${images.length}`;
    }
});

//document.getElementById('next-image').addEventListener('click', function () {
//    loadNewImage();
//});

window.onload = loadNewImage;
