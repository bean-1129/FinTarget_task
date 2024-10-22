# Task Queuing with Rate Limiting API

This project implements a Node.js API for managing user tasks with rate limiting and task queuing.

## Key Features
- **Rate Limiting**: Limits each user to 1 task per second and 20 tasks per minute.
- **Task Queuing**: Tasks exceeding rate limits are queued and processed later.
- **Logging**: Task completion times are logged in a human-readable format.
