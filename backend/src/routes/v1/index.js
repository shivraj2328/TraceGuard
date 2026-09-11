const router = require('express').Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', version: 'v1' });
});

module.exports = router;