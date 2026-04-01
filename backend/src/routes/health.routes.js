const express = require('express');

const router = express.Router();

const startTime = Date.now();

/**
 * GET /health
 * Returns server health status
 */
router.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
