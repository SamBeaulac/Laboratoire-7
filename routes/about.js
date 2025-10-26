const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    const sessionUser = req.session.user;
    res.render('about', { currentPage: 'about', currentUser: sessionUser });
});

module.exports = router;