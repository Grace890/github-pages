// script.js

// --- Experiment Configuration ---
const words = ["cat", "house", "apple", "book", "car", "tree", "water", "friend", "music", "table", "bird", "phone", "sun", "chair", "food"];
const wordDisplayTime = 3000; // 3 seconds in milliseconds
const recallTimeLimit = 60000; // 60 seconds in milliseconds

// --- State Variables ---
let currentCondition = ''; // 'red' or 'green'
let currentWordIndex = 0;
let recallTimeoutId = null;
let recalledWordsArray = [];
let startTime = 0;

// --- DOM Elements ---
const welcomeScreen = document.getElementById('welcome-screen');
const wordPresentationScreen = document.getElementById('word-presentation-screen');
const recallPromptScreen = document.getElementById('recall-prompt-screen');
const thankYouScreen = document.getElementById('thank-you-screen');
const startButton = document.getElementById('start-button');
const wordDisplay = document.getElementById('word-display');
const recallInput = document.getElementById('recall-input');
const submitRecallButton = document.getElementById('submit-recall-button');
const summaryResults = document.getElementById('summary-results');

// --- Helper Functions ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// --- Experiment Flow Functions ---

// 1. Start the experiment
startButton.addEventListener('click', () => {
    // Randomly assign condition
    currentCondition = Math.random() < 0.5 ? 'red' : 'green';
    console.log("Assigned condition:", currentCondition);

    // Start with the word presentation screen
    showScreen('word-presentation-screen');
    startWordPresentation();
});

// 2. Present words one by one
function startWordPresentation() {
    currentWordIndex = 0;
    presentNextWord();
}

function presentNextWord() {
    if (currentWordIndex < words.length) {
        const currentWord = words[currentWordIndex];
        wordDisplay.textContent = currentWord;
        wordDisplay.style.color = currentCondition; // Apply the assigned color

        // Wait for the specified time, then show the next word
        setTimeout(() => {
            currentWordIndex++;
            presentNextWord();
        }, wordDisplayTime);
    } else {
        // All words presented, move to recall screen
        showScreen('recall-prompt-screen');
        startTime = Date.now(); // Record start time for recall
        recallInput.value = ''; // Clear any previous input
        recallInput.focus(); // Focus on the input field
        startRecallTimer();
    }
}

// 3. Handle recall input and timer
function startRecallTimer() {
    recallTimeoutId = setTimeout(() => {
        // Time's up!
        submitRecall(); // Automatically submit when time runs out
    }, recallTimeLimit);
}

recallInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        submitRecall();
    }
});

submitRecallButton.addEventListener('click', submitRecall);

function submitRecall() {
    // Clear the recall timer
    if (recallTimeoutId) {
        clearTimeout(recallTimeoutId);
        recallTimeoutId = null;
    }

    // Get the input value and process it
    const inputText = recallInput.value.trim();
    if (inputText) {
        // Split by commas, trim whitespace, and filter out empty strings
        recalledWordsArray = inputText.split(',')
                                   .map(word => word.trim().toLowerCase())
                                   .filter(word => word.length > 0);
    } else {
        recalledWordsArray = [];
    }

    // Calculate results (number correct, etc.)
    const results = calculateResults(recalledWordsArray);

    // Show thank you screen with results
    showScreen('thank-you-screen');
    displayResults(results);
}

// 4. Calculate results
function calculateResults(recalledWords) {
    // Convert original words to lowercase for case-insensitive comparison
    const originalWordsLower = words.map(word => word.toLowerCase());
    const uniqueOriginalWords = [...new Set(originalWordsLower)]; // Get unique words from original list

    let correctCount = 0;
    const correctWords = [];

    // Check each recalled word against the original list
    recalledWords.forEach(recalledWord => {
        if (originalWordsLower.includes(recalledWord) && !correctWords.includes(recalledWord)) {
            correctCount++;
            correctWords.push(recalledWord);
        }
    });

    return {
        condition: currentCondition,
        recalledWords: recalledWordsArray,
        correctCount: correctCount,
        totalWords: words.length,
        uniqueOriginalWords: uniqueOriginalWords // Store for potential display
    };
}

// 5. Display results on the thank you screen
function displayResults(results) {
    let summaryHTML = `<p>You recalled ${results.correctCount} out of ${results.totalWords} words correctly.</p>`;
    summaryHTML += `<p>Condition: <span style="color:${results.condition};">${results.condition}</span></p>`;

    // Optional: Display the recalled words
    summaryHTML += `<p>Your recalled words:</p><ul id="results-list">`;
    results.recalledWords.forEach(word => {
        summaryHTML += `<li>${word}</li>`;
    });
    summaryHTML += `</ul>`;

    summaryResults.innerHTML = summaryHTML;
}

// --- Initialize (optional) ---
// You could add code here to check if the browser supports local storage if you wanted to save results there.
