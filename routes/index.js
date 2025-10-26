const express = require('express');
const LoginDB = require('../models/LoginDB');

const router = express.Router();

// GET
router.get('/', function(req, res) {
    const sessionUser = req.session.user;

    if(sessionUser && sessionUser.id) 
    {
        return res.redirect(`/dashboard/${sessionUser.username}`);
    }

    res.render('index', { currentPage: 'index', currentUser: sessionUser, error: req.query.error });
});

// POST -- Formulaire Log IN
router.post('/', async function(req, res) {
    const { username, password } = req.body;
    const { user, isInvalid } = await LoginDB.getUserByLogin(username, password);

    if(isInvalid) 
    {
        return res.redirect('/?error=1');
    }

    const activeSessions = req.app.get('activeSessions');
    if (activeSessions && activeSessions.has(user.id)) 
    {
        return res.redirect('/?error=2');
    }

    if(activeSessions) 
    {
        activeSessions.set(user.id, Date.now());
    }

    req.session.user = {
        id: user.id,
        username: user.username,
        welcomeText: user.welcomeText,
        role: user.role
    };

    res.redirect(`/dashboard/${user.username}`);
});

module.exports = router;