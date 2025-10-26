/**
 * @file index.js
 * @author Samuel Beaulac
 * @date 26/10/2025
 * @brief Route pour la page d'accueil
 */

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
    try {
        const { username, password } = req.body;
        
        if(!username || !password) 
        {
            return res.redirect('/?error=1');
        }
        
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
    } catch(error) {
        console.error('Erreur lors du login:', error);
        return res.redirect('/?error=1');
    }
});

module.exports = router;