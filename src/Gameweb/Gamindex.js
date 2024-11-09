import React, { useState, useEffect } from "react"; // Import React hooks
import { useRef } from "react"; // Import useRef for referencing DOM elements
import "./gamestyle.css"; // Import CSS file for styling
import confetti from "canvas-confetti"; // Import confetti for celebration effects
// import Header from './Header'; // Header component, currently commented out
import axios from "axios"; // Import axios for making HTTP requests
import html2canvas from "html2canvas"; // Import html2canvas for capturing screenshots
import { useLocation } from "react-router-dom"; // Import useLocation to get route data
import { v4 as uuidv4 } from "uuid"; // Import uuid for generating unique session IDs

// Import image assets
import image1 from './image1.jpg';
import pen from './pen.jpg';
import hen from './hen.jpg';
import car1 from './car1.jpeg';
import grapes from './grapes.jpg';
import cat from './Cat_March_2010-1a.jpg';

// Array of questions with images and correct answers
const questions = [
  { src: image1, answer: 'apple'  },
  { src: pen, answer: 'pen' },
  { src: hen, answer: 'hen' },
  { src: car1, answer: 'car' },
  { src: grapes, answer: 'grapes' },
  { src: cat, answer: 'cat' },
];  

const Game = () => {
  const location = useLocation(); // Get location data for session name
  const [sessionName, setSessionName] = useState(""); // State to store session name

  useEffect(() => {
    const session = location.state?.sessionName || "Undefined"; // Get session name from location state
    setSessionName(session); // Set session name in state
    console.log("Session Name is:", session); // Log session name
  }, [location.state]);

  // Define game states
  const [shuffledQuestions, setShuffledQuestions] = useState([]); // State to store shuffled questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // State to store current question index
  const [score, setScore] = useState(0); // State to store score
  const [timeRemaining, setTimeRemaining] = useState(2 * 60); // 2 minutes in seconds
  const [showEndScreen, setShowEndScreen] = useState(false); // State to show end screen
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null); // State for selected answer index
  const [hasStarted, setHasStarted] = useState(false); // State to check if game has started
  const [webcamGranted, setWebcamGranted] = useState(false); // State to check if webcam access is granted
  const [cameraActive, setCameraActive] = useState(false); // State to check if camera is active
  const [currentIndex, setCurrentIndex] = useState(0); // State to track current question index for images
  const [answerStates, setAnswerStates] = useState([]); 
  const [guess, setGuess] = useState(''); // State to store user's guess
  const [resultMessage, setResultMessage] = useState(''); // State to store result message
  const [messageColor, setMessageColor] = useState(''); // State to store color for result message
  const speech = new SpeechSynthesisUtterance(); // Speech synthesis object for speaking

  const [sessionId, setSessionId] = useState(null); // State for session ID
  const { v4: uuidv4 } = require("uuid"); // Import uuid function again (redundant)
  let newSessionId = "null"; // Variable for new session ID

  const videoRef = useRef(null); // Reference to video element for webcam
  const canvasRef = useRef(null); // Reference to canvas for capturing images
  const captureIntervalRef = useRef(null); // Reference for interval to capture images periodically

  const [file, setFile] = useState(null); // State to store captured file
  const isCameraActive = () => { // Function to check if camera is active
    const stream = videoRef.current?.srcObject; // Get video stream
    if (stream && stream.getVideoTracks().length > 0) {
      const track = stream.getVideoTracks()[0]; // Get first video track
      return track.readyState === "live" && track.enabled; // Return camera state
    }
    return false; // Return false if no active camera
  };

  // Function to request webcam access
  const requestWebcamAccess = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream; // Set video stream
        setWebcamGranted(true); // Update webcam access state

        const track = stream.getVideoTracks()[0]; // Get camera track
        if (track.readyState === "live" && track.enabled) {
          setCameraActive(true); // Camera is active
        } else {
          setCameraActive(false); // Camera not active
        }
        videoRef.current.style.display = "none"; // Hide video element

        // Periodically check if camera is still active
        const checkInterval = setInterval(() => {
          if (!isCameraActive()) {
            setCameraActive(false);
          } else {
            console.log("Camera is active only ");
            setCameraActive(true);
          }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(checkInterval); // Cleanup interval
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        setWebcamGranted(false); // Update webcam access state
        setCameraActive(false); // Camera not active
      });
  };

  useEffect(() => {
    setShuffledQuestions(questions.sort(() => Math.random() - 0.5)); // Shuffle questions on mount
  }, []);

  useEffect(() => {
    if (timeRemaining > 0 && !showEndScreen) {
      const timerId = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1); // Countdown timer
      }, 1000);
      return () => clearInterval(timerId); // Cleanup timer
    } else if (timeRemaining <= 0) {
      endGame(); // End game when timer reaches 0
    }
  }, [timeRemaining, showEndScreen]);

  const startGame = () => {
    if (!webcamGranted || !isCameraActive()) {
      alert(
        "Please allow access to the camera and ensure it is active to start the game."
      );
      return;
    }
    newSessionId = uuidv4(); // Generate session ID
    setSessionId(uuidv4());
    console.log("Session id generated..." + newSessionId);
    setShuffledQuestions(questions.sort(() => Math.random() - 0.5)); // Shuffle questions again
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeRemaining(2 * 60); // Reset timer to 2 minutes
    setShowEndScreen(false);
    setSelectedAnswerIndex(null);
    setAnswerStates([]);
    setHasStarted(true); // Start game
    captureIntervalRef.current = setInterval(captureImage, 10000); // Capture image every 10s
    document.body.classList.remove("correct", "wrong");
    document.body.style.backgroundColor = ""; // Reset background color
  };
/* Function for capturing and uploading images */ 
  const captureImage = () => {
    if (!isCameraActive()) {
      alert("Camera is not active. Please ensure the camera is turned on.");
      return;
    }
    if (!newSessionId) {
      // Check if sessionId is null
      console.error("Session ID is null. Cannot capture images.");
      return; // Skip capture if no session ID is set
    }

    // Capture the video feed
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Capture the entire webpage using html2canvas
    html2canvas(document.body).then((screenshotCanvas) => {
      screenshotCanvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append("screenshot", blob, "screenshot.png"); // Screenshot of the page
        formData.append("newSessionId", newSessionId); // Add session ID to the form data
        formData.append("sessionName", sessionName);
        console.log("Captured screenshot. Session ID: " + newSessionId);

        // Send the screenshot image to the server
        axios
          .post("http://localhost:5000/screenshots", formData)
          .then((response) =>
            console.log("Screenshot uploaded:", response.data)
          )
          .catch((error) =>
            console.error("Error uploading screenshot:", error)
          );
      });
    });

    // Capture the video feed image as before
    canvas.toBlob((blob) => {
      const formData = new FormData();
      formData.append("image", blob, "capture.png"); // Append the image file
      formData.append("newSessionId", newSessionId); // Append the session ID
      formData.append("sessionName", sessionName); // Append the session name

      console.log(
        "Image captured. Session ID: " +
          newSessionId +
          " | Session Name: " +
          sessionName
      );

      // Send the image, session ID, and session name to the server
      axios
        .post("http://localhost:5000/uploads", formData)
        .then((response) =>
          console.log("Image uploaded with session details:", response.data)
        )
        .catch((error) =>
          console.error("Error uploading image with session details:", error)
        );
    });
  }; 
  // const setNextQuestion = () => { /* Function to set the next question */ }
  // const selectAnswer = (index, correct) => { /* Function for selecting an answer */ }
   /* Function for ending the game */
  const endGame = () => {
    setShowEndScreen(true);
    clearInterval(captureIntervalRef.current); // Stop image capture

    const createConfetti = () => {
      confetti({
        particleCount: 10,
        spread: 360,
        startVelocity: Math.random() * 15 + 15,
        ticks: 300,
        gravity: 0.6,
        //colors: [colorOptions[Math.floor(Math.random() * colorOptions.length)]],
        origin: { x: Math.random(), y: -0.1 },
      });
    };

    const confettiInterval = setInterval(() => {
      createConfetti();
     // particleCount -= 10;
     // if (particleCount <= 0) {
       // clearInterval(confettiInterval);
     // }
    }, 30);

    setTimeout(() => clearInterval(confettiInterval), 10000);
  };
  useEffect(() => {
    loadNewImage();
  }, [currentIndex]);

  const loadNewImage = () => {
    if (currentIndex < questions.length) {
      setResultMessage('');
      setGuess('');
     } 
     else {
       displayWinMessage();
      <button className="btn" onClick={() => (window.location.href = "/")}>
            Home
          </button>
   }
  }; /* Function for ending the game */ 
  //const loadNewImage = () => { /* Function to load a new question image */ }
  /* Function to display win message */ 
  const displayWinMessage = () => {
    document.body.innerHTML = ''; // Clear everything
    const h = document.createElement('h1'); // Create a new header element
    h.textContent = 'HURRAY!! YOU HAVE COMPLETED THE QUIZ !';
    h.style.color = 'green';
    h.style.textAlign = 'center';
    document.body.appendChild(h);
    speech.text = 'HURRAY!! YOU HAVE COMPLETED THE QUIZ !';
    window.speechSynthesis.speak(speech);
    const homeButton = document.createElement('button');
   homeButton.textContent = 'Back to Homepage';
   homeButton.style.display = 'block';
   homeButton.style.margin = '20px auto';
   homeButton.style.padding = '10px 20px';
   homeButton.style.fontSize = '16px';
   homeButton.onclick = () => {
       window.location.href = "/"; // Redirect to homepage
   };
   document.body.appendChild(homeButton);
  }; 
  /* Function to handle user's guess submission */
  const handleGuessSubmit = () => {
    const userGuess = guess.toLowerCase();
    const correctAnswer = questions[currentIndex].answer.toLowerCase();
    speech.text = guess;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    window.speechSynthesis.speak(speech);

    if (userGuess === correctAnswer) {
      speech.text = 'Correct!';
      window.speechSynthesis.speak(speech);
      setResultMessage('Correct!');
      setMessageColor('green'); // Set message color to green
      setScore(score + 1);
      if (currentIndex + 1 < questions.length) {
        setTimeout(() => setCurrentIndex(currentIndex + 1), 2500);
      }
       else {
      displayWinMessage();
       }
    } else {
      speech.text = 'Try again!';
      window.speechSynthesis.speak(speech);
      setResultMessage('Try again!');
      setMessageColor('red'); // Set message color to red
    }
  };  

  useEffect(() => {
    loadNewImage(); // This is equivalent to window.onload in vanilla JS
  }, []);

  return (
    <div className="gamestyle-body"> {/* Main container */}
      <video
        ref={videoRef} autoPlay playsInline style={{ display: "none" }}></video>
      <canvas ref={canvasRef} style={{ display: "none" }} width="640" height="480"></canvas>

      {!webcamGranted ? requestWebcamAccess()
        : !cameraActive ? requestWebcamAccess()
        : !hasStarted ? startGame()
        : !showEndScreen ? (
          <div className="gamestyle-body">
            <div className="game-timer">
              Time Remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
            </div>
            <div className="gamestyle-box1">
              <div className="gamestyle-box2">
                <h1>Guess the object!!!</h1>
                {currentIndex < questions.length && (
                  <img id="gamestyle-image" src={questions[currentIndex].src} alt="Guess the object" width="200px" />
                )}
                <div className="gamestyle-box3">
                  <input className="gamestyle-guess-input" type="text" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Enter your guess" />
                  <button onClick={handleGuessSubmit}>Submit Guess</button>
                  <p className="gamestyle-result-message" style={{ color: messageColor }}>{resultMessage}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="end-screen">
            <h2>Game Over!</h2>
            <p>Your Score: {score}</p>
            <button onClick={startGame}>Play Again</button>
          </div>
        )
      }
    </div>
  );
};

export default Game;
