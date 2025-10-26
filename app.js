/**
 * @file app.js
 * @author Samuel Beaulac
 * @date 26/10/2025
 * @brief Configuration principale du serveur Express
 */

const express = require('express');
const cookieSession = require('cookie-session');
const path = require('path');
const app = express();

const port = 3000;
const url = `http://localhost:${port}/`

const routes = {
    root : {
        path : '/',
        router : require('./routes/index')
    },
    about : {
        path : '/about',
        router : require('./routes/about')
    },
    contact : { 
        path : '/contact',
        router : require('./routes/contact')
    },
    dashboard : { 
        path : '/dashboard',
        router : require('./routes/dashboard')
    },
    logout : { 
        path : '/logout',
        router : require('./routes/logout')
    }
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views', 'pages'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use(cookieSession({
    name: 'session',
    keys: ['todotopsecret'],
    maxAge: 24 * 60 * 60 * 1000 
}));

const activeSessions = new Map();
app.set('activeSessions', activeSessions);

app.use(function(req, res, next) {
    if (!req.session.user) 
    {
        req.session.user = {
            id: 0,
            username: '',
            role: 0
        };
    }
    next();
});

for(const key in routes) {
    const obj = routes[key];
    const path = obj.path;
    const route = obj.router;
    app.use(path, route);
}

app.use(function(req, res) {
    res.status(404).render('404', {
        currentPage: '404',
        currentUser: null 
    });
});

app.listen(port, function() {
    console.log(`Server is running on : ${url}`);
});