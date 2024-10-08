window.onload = function () {
    const actionBtn = document.getElementById('actionBtn');
    const voiceText = document.getElementById('voiceText');
    const stopwatchElem = document.getElementById('stopwatch');

    let recognition;
    let isRecognizing = false;
    let isPaused = false;

    let hours = 0, minutes = 0, seconds = 0;
    let stopwatchInterval;
    let accumulatedText = ''; // To store recognized text across sessions

    // Check for Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Sorry, your browser does not support speech recognition.");
        actionBtn.disabled = true;
        return;
    }

    // Initialize Speech Recognition
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Request microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            console.log('Microphone access granted.');
        })
        .catch(function(err) {
            console.error('Microphone access denied: ', err);
            voiceText.textContent = "Microphone access is required for voice recognition.";
            actionBtn.disabled = true;
        });

    // Start the stopwatch
    function startStopwatch() {
        stopwatchInterval = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                seconds = 0;
                minutes++;
            }
            if (minutes === 60) {
                minutes = 0;
                hours++;
            }
            stopwatchElem.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // Stop the stopwatch
    function stopStopwatch() {
        clearInterval(stopwatchInterval);
    }

    // Reset stopwatch
    function resetStopwatch() {
        hours = 0;
        minutes = 0;
        seconds = 0;
        stopwatchElem.textContent = "00:00:00";
    }

    // Handle voice recognition results in real-time
    recognition.onresult = function (event) {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim();
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript + ' ';
            }
        }

        accumulatedText += finalTranscript; // Append final transcripts to accumulated text
        voiceText.textContent = accumulatedText + interimTranscript; // Update with both final and interim text
    };

    // Start or Resume Recognition
    function startRecognition() {
        if (!isRecognizing || isPaused) {
            recognition.start();
            isRecognizing = true;
            isPaused = false;
            startStopwatch();
            actionBtn.textContent = 'Stop Recognition';
        }
    }

    // Stop Recognition
    function stopRecognition() {
        if (isRecognizing) {
            recognition.stop();
            isPaused = true;
            stopStopwatch();
            actionBtn.textContent = 'Resume Recognition';
        }
    }

    // Button click handler
    actionBtn.addEventListener('click', () => {
        if (!isRecognizing || isPaused) {
            startRecognition();
        } else {
            stopRecognition();
        }
    });

    // Error handling
    recognition.onerror = function (event) {
        voiceText.textContent = "Error: " + event.error;
        stopStopwatch();
        actionBtn.textContent = 'Start Recognition';
    };
};
