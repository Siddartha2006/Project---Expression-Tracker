// Emotion data provided
const emotionData = [
    [
        { "label": "neutral", "score": 0.9921979308128357 },
        { "label": "happy", "score": 0.7727994918823242 },
        { "label": "sad", "score": 0.3198908269405365 },
        { "label": "fear", "score": 0.18553420901298523 },
        { "label": "angry", "score": 0.15843608975410461 }
    ],
    [
        { "label": "happy", "score": 0.9839347004890442 },
        { "label": "neutral", "score": 0.9267033934593201 },
        { "label": "sad", "score": 0.3429185152053833 },
        { "label": "surprise", "score": 0.22977325320243835 },
        { "label": "fear", "score": 0.14761514961719513 }
    ],
    [
        { "label": "surprise", "score": 0.9428425431251526 },
        { "label": "fear", "score": 0.8722813725471497 },
        { "label": "happy", "score": 0.8339279294013977 },
        { "label": "neutral", "score": 0.32216647267341614 },
        { "label": "sad", "score": 0.18508300185203552 }
    ],
    [
        { "label": "neutral", "score": 0.9233937859535217 },
        { "label": "sad", "score": 0.8555231690406799 },
        { "label": "happy", "score": 0.7757681012153625 },
        { "label": "fear", "score": 0.34929537773132324 },
        { "label": "angry", "score": 0.17787416279315948 }
    ]
];

// Display data in a formatted way
document.getElementById('data-output').textContent = JSON.stringify(emotionData, null, 2);

// Function to prepare data for the charts
function prepareChartData() {
    const allScores = {};

    // Aggregate scores for each label
    emotionData.forEach(entry => {
        entry.forEach(emotion => {
            if (!allScores[emotion.label]) {
                allScores[emotion.label] = 0;
            }
            allScores[emotion.label] += emotion.score;
        });
    });

    return allScores;
}

// Create Pie Chart
function createPieChart() {
    const data = prepareChartData();
    const ctx = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Emotion Scores',
                data: Object.values(data),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Create Histogram
function createHistogram() {
    const data = prepareChartData();
    const ctx = document.getElementById('histogramChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Emotion Scores',
                data: Object.values(data),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize charts
createPieChart();
createHistogram();
