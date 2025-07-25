const express = require("express");
const router = express.Router();

module.exports = (channel, IN_QUEUE) => {

    router.post("/submit-prompt", async(req, res) => {
        const {prompt, sessionId} = req.body;

        if (!prompt || !sessionId) {
            return res.status(400).json({
                error: 'Prompt and sessionId are required!'
            })
        }

        const jobId = sessionId + '_' + Date.now();

       try {
        channel.sendToQueue(IN_QUEUE, Buffer.from(JSON.stringify({ prompt, sessionId, jobId })), { persistent: true });
        res.json({ status: 'submitted', jobId });
        } catch (error) {
            console.error('Failed to submit prompt: ', error);
            res.status(500).json({ error : 'Failed to submit prompt'});
        }
    });

    router.get('/get-result', async (req, res) => {
        res.status(501).json({error: 'Not implemented yet. '});
    });

    return router;
}