/**
 * @file about.js
 * @author Samuel Beaulac
 * @date 26/10/2025
 * @brief Route pour la page à propos
 */

const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    const sessionUser = req.session.user;
    res.render('about', { currentPage: 'about', currentUser: sessionUser });
});

module.exports = router;