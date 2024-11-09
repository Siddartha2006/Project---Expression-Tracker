import React, { useEffect } from 'react';
import './Gameweb.css';
import { useNavigate } from "react-router-dom";
import VanillaTilt from 'vanilla-tilt';
import WebcamEmotionAnalysis from './videolink';
import image from "./image.png";
import word from "./word.jpg";

function Gameweb() {
  useEffect(() => {
    VanillaTilt.init(document.querySelectorAll(".gameweb-card"), {
      max: 25,
      speed: 400,
    });
  }, []);
  const navigate = useNavigate();

  const handleClicksss = () => {
    navigate("/Gameindex");
  };


  return (
    <div className="gameweb-root">
      <header className="gameweb-header">
        <nav className="gameweb-nav">
          <h1>JOY WITH LEARNING</h1>
          <a href="/login/login.html">
            <i className="fa-solid fa-user"> login</i>
          </a>
        </nav>
      </header>

      <div className="gameweb-container">
        <div className="gameweb-card">
          <img src={image} alt="Guessing Game" />
          <h2>GUESSING GAME</h2>
          <WebcamEmotionAnalysis/>
          <p>The player's goal is to correctly identify objects within an image.</p>
          {/* <a href="/game2/gameindex.html> */}
            <button className="gameweb-button" onClick={handleClicksss}>
              Play Now
            </button>
          {/* </a> */}
        </div>
        <div className="gameweb-card">
          <img src={word} alt="Word Puzzle" />
          <h2>WORD PUZZLE</h2>
          <p>It is a challenging word game where you create words.</p>
          <a href="/game1/indeg.html">
            <button className="gameweb-button">
              Play Now
            </button>
          </a>
        </div>
      </div>

      {/* Move these to your index.html or App.js */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}

export default Gameweb;