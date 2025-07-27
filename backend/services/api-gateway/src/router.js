const express = require("express");
const router = express.Router();
const {createClient} = require("redis");

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
redisClient.connect();


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

    // GET /get-result?jobId=...
    router.get('/get-result', async (req, res) => {
        const jobId = req.query.jobId;
        if (!jobId) return res.status(400).json({ error: 'jobId required' });

        const result = await redisClient.get(jobId);
        if (result) {
        res.json(JSON.parse(result)); // Returns { mermaid, architecture, status }
        } else {
        res.status(202).json({ status: 'pending' }); // Not ready yet
        }
    });


    
    return router;
}