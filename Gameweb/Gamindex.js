// import { Buffer } from 'buffer';
// import process from 'process';
import React, { useState, useEffect } from "react";
import { useRef } from "react";
import "./gamestyle.css";
import confetti from "canvas-confetti";
// import Header from './Header';
import axios from "axios";
import html2canvas from "html2canvas"; // Import html2canvas
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"; // Import uuid

import image1 from './image1.jpg';
import pen from './pen.jpg';
import hen from './hen.jpg';
import car1 from './car1.jpeg';
import grapes from './grapes.jpg';
import cat from './Cat_March_2010-1a.jpg';

const questions = [
  { src: image1, answer: 'apple'  },
  { src: pen, answer: 'pen' },
  { src: hen, answer: 'hen' },
  { src: car1, answer: 'car' },
  { src: grapes, answer: 'grapes' },
  { src: cat, answer: 'cat' },
];  

const Game = () => {
  const location = useLocation();
  const [sessionName, setSessionName] = useState("");

  useEffect(() => {
    const session = location.state?.sessionName || "Unnamed Session";
    setSessionName(session);
    console.log("Session Name (in game.js):", session); // Ensure this is printed correctly
  }, [location.state]);

  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(2 * 60); // 3 minutes
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [answerStates, setAnswerStates] = useState([]); // Array to track button states
  const [hasStarted, setHasStarted] = useState(false); // New state for game start
  const [currentInput, setCurrentInput] = useState("");
  const [keyStates, setKeyStates] = useState({});
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [webcamGranted, setWebcamGranted] = useState(false); // State to track webcam access
  const [cameraActive, setCameraActive] = useState(false); // State to track if the camera is active
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [messageColor, setMessageColor] = useState(''); // To store the message color
  const speech = new SpeechSynthesisUtterance();

  const [sessionId, setSessionId] = useState(null); // State for session ID
  const { v4: uuidv4 } = require("uuid");
  let newSessionId = "null";

  const videoRef = useRef(null); // Reference to the video element
  const canvasRef = useRef(null); // Reference to the canvas element for capturing images
  const captureIntervalRef = useRef(null); // To store the interval ID for image capture

  const [file, setFile] = useState(null);
  const isCameraActive = () => {
    const stream = videoRef.current?.srcObject;
    if (stream && stream.getVideoTracks().length > 0) {
      const track = stream.getVideoTracks()[0];
      return track.readyState === "live" && track.enabled; // Check if track is live and enabled
    }
    return false;
  };

  // Function to request webcam access
  const requestWebcamAccess = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setWebcamGranted(true);

        const track = stream.getVideoTracks()[0];

        // Check if the camera track is live
        if (track.readyState === "live" && track.enabled) {
          setCameraActive(true);
        } else {
          setCameraActive(false);
        }

        videoRef.current.style.display = "none"; // hide the vedio feed

        // Periodically check if the camera is still active
        const checkInterval = setInterval(() => {
          if (!isCameraActive()) {
            //alert("Camera is not active. Please ensure the camera is turned on.");
            setCameraActive(false);
          } else {
            console.log("Camera is active only ");
            setCameraActive(true);
          }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(checkInterval); // Clean up interval
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        setWebcamGranted(false); // Webcam access denied
        setCameraActive(false); // Camera not active
      });
  };

  useEffect(() => {
    // shuffling the questions during the game play
    setShuffledQuestions(questions.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (timeRemaining > 0 && !showEndScreen) {
      const timerId = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeRemaining <= 0) {
      endGame();
    }
  }, [timeRemaining, showEndScreen]);

  const startGame = () => {
    if (!webcamGranted || !isCameraActive()) {
      alert(
        "Please allow access to the camera and ensure it is active to start the game."
      );
      return;
    }
    newSessionId = uuidv4();
    setSessionId(uuidv4()); // Generate a new session ID
    console.log("Session id generated..." + newSessionId);
    //handleUpload();
    setShuffledQuestions(questions.sort(() => Math.random() - 0.5));
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeRemaining(2 * 60);
    setShowEndScreen(false);
    setSelectedAnswerIndex(null);
    setAnswerStates([]);
    setHasStarted(true); // Start the game
    captureIntervalRef.current = setInterval(captureImage, 10000);
    // start image caputre(calling the image capture function for every 30 secs)
    document.body.classList.remove("correct", "wrong");
    document.body.style.backgroundColor = ""; // Reset to original color at the start
  };

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
  // const handleUpload = async () => {
  //   console.log("Handel upload called");
  //   const formData = new FormData();
  //   formData.append('newSessionId', newSessionId);  // Add sessionId
  //   formData.append('sessionName', sessionName); // Add sessionName

  //   try {
  //       const response = await fetch('http://localhost:5000', {
  //           method: 'POST',
  //           body: formData,
  //       });

  //       const result = await response.json();
  //       console.log(result);
  //   } catch (error) {
  //       console.error('Error uploading file:', error);
  //   }
  // };

  const setNextQuestion = () => {
    setSelectedAnswerIndex(null);
    setAnswerStates([]);
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const selectAnswer = (index, correct) => {
    if (selectedAnswerIndex !== null) return; // Prevent further clicks

    const correctIndex = shuffledQuestions[
      currentQuestionIndex
    ].answers.findIndex((ans) => ans.correct);
    const newAnswerStates = shuffledQuestions[currentQuestionIndex].answers.map(
      (ans, i) => {
        if (i === correctIndex) {
          return "correct";
        }
        if (i === index) {
          return correct ? "correct" : "wrong";
        }
        return "wrong";
      }
    );

    setSelectedAnswerIndex(index);
    setAnswerStates(newAnswerStates);

    if (correct) {
      setScore((prevScore) => prevScore + 1);
      document.body.classList.add("correct");
    } else {
      document.body.classList.add("wrong");
    }

    // Delay for visual feedback before moving to the next question
    setTimeout(() => {
      document.body.classList.remove("correct", "wrong"); // Remove the class before next question
      document.body.style.backgroundColor = ""; // Reset to original color

      if (currentQuestionIndex + 1 < shuffledQuestions.length) {
        setNextQuestion();
      } else {
        endGame();
      }
    }, 1000); // 1 second delay
  };

  const endGame = () => {
    setShowEndScreen(true);
    clearInterval(captureIntervalRef.current); // Stop image capture

    document.body.classList.remove("correct", "wrong");
    document.body.style.backgroundColor = ""; // Reset to original color for end screen
    triggerConfetti();
  };

  const triggerConfetti = () => {
    let particleCount = 500;
    const colorOptions = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#ffffff",
    ];

    const createConfetti = () => {
      confetti({
        particleCount: 10,
        spread: 360,
        startVelocity: Math.random() * 15 + 15,
        ticks: 300,
        gravity: 0.6,
        colors: [colorOptions[Math.floor(Math.random() * colorOptions.length)]],
        origin: { x: Math.random(), y: -0.1 },
      });
    };

    const confettiInterval = setInterval(() => {
      createConfetti();
      particleCount -= 10;
      if (particleCount <= 0) {
        clearInterval(confettiInterval);
      }
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
  };

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
    <div className="gamestyle-body">
      {/* <Header /> */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ display: "none" }}
      ></video>
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width="640"
        height="480"
      ></canvas>

     { !webcamGranted ? (
        // <div className="start-screen">
        // //    <button className="btn start-btn" onClick={requestWebcamAccess}>
        // //     Allow to access camera
        // //   </button> 
        // // </div>
        requestWebcamAccess()
      ): !cameraActive ? (
        // 
        requestWebcamAccess()
      ) : !hasStarted ? (
        // 
        startGame()
      ) : !showEndScreen ? (
          <div className="gamestyle-body">
          <div className="game-timer">
            Time Remaining: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </div>
          
          <div className="gamestyle-box1">
        <div className="gamestyle-box2">
          <h1>Guess the object!!!</h1>
          {currentIndex < questions.length && (
            <img
              id="gamestyle-image"
              src={questions[currentIndex].src} // Dynamically set the image source
              alt="Guess the object"
              width="200px"
            />
          )}
          <div className="gamestyle-box3">
            <input
              className="gamestyle-guess-input"
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Your guess"
            />
            <p>
              <b
                className="gamestyle-result-message"
                style={{ color: messageColor }} // Apply dynamic color based on result
              >
                {resultMessage}
              </b>
            </p>
            <button className="gamestyle-submit-guess" onClick={handleGuessSubmit}>
              Submit
            </button>
            </div>
        </div>
      </div>
    </div>
      ):(
        <p>
              <b className="gamestyle-score">
                Score: {score}/{questions.length}
              </b>
            </p>
      )}
        </div>
      );
    };
export default Game;
