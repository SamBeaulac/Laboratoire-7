/**
 * @file contact.js
 * @author Samuel Beaulac
 * @date 26/10/2025
 * @brief Route pour la page de contact
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const contactFile = path.join(__dirname, '..', 'contact.txt');

router.get('/', function(req, res) {
    const sessionUser = req.session.user;
    res.render('contact', { currentPage: 'contact', currentUser: sessionUser });
});

router.post('/', function(req, res) {
    const obj = req.body;
    const fname = obj.fname;
    const lname = obj.lname;
    const email = obj.email;
    const tel = obj.tel;
    const message = obj.message;

    // Validation 

      const contactInfo = `
{
    Date: ${new Date().toLocaleString()}
    Prénom: ${fname}
    Nom: ${lname}
    Email: ${email}
    Téléphone: ${tel}
    Message: 
    ${message}
}
        `;

    
    fs.appendFile(contactFile, contactInfo, 'utf8', function(err) {
        if(err)
        {
            console.log(err);
            return;
        }
        res.redirect('/contact?submited')
    });
    
})

module.exports = router;