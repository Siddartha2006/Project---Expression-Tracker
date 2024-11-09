import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './DetailedAnalysis.css';

const ExpressionAnalysis = () => {
  const [sessionData, setSessionData] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const { sessionId } = useParams(); 

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/detailed_sessions/${sessionId}`);
        console.log('Fetched session data:', response.data);
        setSessionData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching session data');
        setLoading(false);
      }
    };
    fetchSessionData();
  }, [sessionId]);

  useEffect(() => {
    if (sessionData) {
      console.log('Updated sessionData:', sessionData);
    }
  }, [sessionData]);

  const calculateHighestEmotion = (emotionArray) => {
    let highestEmotion = { label: '', score: 0 };

    emotionArray.forEach((emotionObject) => {
      if (emotionObject.score > highestEmotion.score) {
        highestEmotion = {
          label: emotionObject.label,
          score: emotionObject.score * 100, // Convert score to percentage
        };
      }
    });

    return highestEmotion;
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="circular-loader"></div>
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!sessionData || !sessionData.imagePaths || !sessionData.screenshotPaths || !sessionData.modelResponse) {
    return <p>No data found for this session.</p>;
  }

  return (
    <div className="detailedanalysis-container-fluid">
      <div className="detailedanalysis-image-strip-container">
        <h1>DETAILED ANALYSIS</h1>
        <div className="detailedanalysis-image-strip">
          {sessionData.imagePaths.map((imagePath, index) => {
            const emotions = sessionData.modelResponse[index];
            const highestEmotion = calculateHighestEmotion(emotions);
            const timestamp = (index + 1) * 10;

            return (
              <div key={index} className="detailedanalysis-image-box">
                <div className="detailedanalysis-time-percentage">
                  {highestEmotion.label}: {highestEmotion.score.toFixed(2)}% - Captured at {timestamp}s
                </div>
                <div className="detailedanalysis-image-container">
                  <img src={`http://localhost:5000/${sessionData.screenshotPaths[index]}`} alt={`Screenshot ${index + 1}`} />
                  <img src={`http://localhost:5000/${imagePath}`} alt={`Webcam ${index + 1}`} />
                </div>
                <div className="detailedanalysis-detailed-analysis">
                  <strong>Detailed Analysis:</strong><br />
                  {emotions.map((emotionObject, emotionIndex) => (
                    <div key={emotionIndex}>
                      {emotionObject.label}: {(emotionObject.score * 100).toFixed(2)}%
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpressionAnalysis;
