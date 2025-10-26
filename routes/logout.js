/**
 * @file logout.js
 * @author Samuel Beaulac
 * @date 26/10/2025
 * @brief Route pour la déconnexion
 */

const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const active = req.app.get('activeSessions');
  const uid = req.session?.user?.id;
  if (active && uid) active.delete(uid);

  req.session = null;

  res.status(204).end();
});

module.exports = router;