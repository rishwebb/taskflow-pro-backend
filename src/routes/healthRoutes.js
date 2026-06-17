const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'TaskFlow Pro API',
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: Date.now()
    }
  });
});

module.exports = router;
