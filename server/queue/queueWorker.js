const jobQueue = require('./exports/queue');
const { AdminController } = require('../controllers/AdminController');

jobQueue.process(async (job) => {
    try {
        const { controllerMethod, payload } = job.data;
        if (controllerMethod && typeof controllerMethod === 'function') {
            await controllerMethod(payload);
        } else {
            console.error('Invalid controllerMethod');
        }
    } catch (error) {
        console.error('Error processing job:', error);
    }
});

module.exports = jobQueue;
