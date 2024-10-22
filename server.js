require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const { Queue } = require('bull');
const redis = require('redis');
const fs = require('fs');
const path = require('path');
const Bull = require('bull');

const app = express();
app.use(express.json());

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const taskQueue = new Bull('taskQueue', { redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT } });

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, 
  keyGenerator: (req) => req.body.user_id,
  handler: (req, res) => {
    res.status(429).send('Rate limit exceeded, your request is queued.');
  },
});

app.use(limiter);

const currentDate = new Date();
const formattedDate = currentDate.toISOString().replace('T', ' ').substring(0, 19);

async function task(user_id) {
  const logMessage = `${user_id}-task completed at-${formattedDate}\n`;
  fs.appendFile(path.join(__dirname, process.env.LOG_FILE_PATH), logMessage, (err) => {
    if (err) throw err;
    console.log(logMessage);
  });
}

taskQueue.process(async (job) => {
  const { user_id } = job.data;
  await task(user_id);
});

app.post('/api/v1/task', async (req, res) => {
  const { user_id } = req.body;

  await taskQueue.add({ user_id });

  res.send('Task received and queued if necessary.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Worker process running on port ${PORT}`);
});
