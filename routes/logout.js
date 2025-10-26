const express = require('express');
const router = express.Router();

// Était: router.post('/logout', ...
router.post('/', (req, res) => {
  const active = req.app.get('activeSessions');
  const uid = req.session?.user?.id;
  if (active && uid) active.delete(uid);

  // cookie-session
  req.session = null;

  // IMPORTANT: terminer la réponse
  res.status(204).end();
});

module.exports = router;