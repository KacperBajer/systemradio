// server.js
const express = require('express');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

let pythonProcess = null;

// Start the audio streaming client
app.get('/start-audio', (req, res) => {
    if (pythonProcess) {
        return res.status(400).send('Audio streaming client is already running.');
    }

    pythonProcess = spawn('python', ['client.py']);  // Update with the correct path to your Python script

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        pythonProcess = null;
    });

    res.send('Audio streaming client started.');
});

// Stop the audio streaming client
app.get('/stop-audio', (req, res) => {
    if (!pythonProcess) {
        return res.status(400).send('Audio streaming client is not running.');
    }

    pythonProcess.kill('SIGINT');  // Gracefully stop the process
    pythonProcess = null;

    res.send('Audio streaming client stopped.');
});

// Health check endpoint
app.get('/status', (req, res) => {
    res.send({
        running: !!pythonProcess,
        message: pythonProcess ? 'Audio streaming client is running.' : 'Audio streaming client is stopped.'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
