/**
 * @file dashboard.js
 * @author Samuel Beaulac
 * @date 26/10/2025
 * @brief Route pour le tableau de bord utilisateur
 */

const express = require('express');
const LoginDB = require('../models/LoginDB');

const router = express.Router();

// Contrôle d'accès
router.use('/:username', async function(req, res, next) 
{
   const sessionUser = req.session.user;
   if(!sessionUser || !sessionUser.id)
   {
      return res.redirect('/');
   }

   const currentUser = await LoginDB.getUserById(sessionUser.id);
   if(!currentUser)
   {
      req.session = null;
      return res.redirect('/');
   }

   if(req.params.username !== currentUser.username)
   {
      return res.redirect(`/dashboard/${currentUser.username}`);
   }

   req.currentUser = currentUser;
   next();
});

// GET
router.get('/:username', async function(req, res) {
   const currentUser = req.currentUser;

   let users = [];
   if(currentUser.role > 2) 
   {
      users = await LoginDB.getUsersInformation();
   }
   
   const flashMessage = req.query.updated;

   res.render('dashboard', { 
      currentPage: 'dashboard',
      currentUser,
      users,
      flashMessage,
   });
});

// POST
router.post('/:username', async function(req, res) {
   const currentUser = req.currentUser;

   if(req.body.dbModifySubmit) 
   {
      if(currentUser.role === 0) 
      {
         return res.redirect(`/dashboard/${currentUser.username}?updated=0`);
      }

      try {
         const updates = {};
         let anyUpdate = false;

         if(req.body.username && req.body.username.trim())
         {
            updates.username = req.body.username.trim();
         }

         if(req.body.password && req.body.password.trim() && currentUser.role > 1)
         {
            updates.password = req.body.password.trim();
         }
         
         if(currentUser.role > 0 && req.body.welcomeText !== undefined) 
         {
            updates.welcomeText = req.body.welcomeText;
         }

            const result = await LoginDB.changeUserInformation(currentUser.id, updates);
         
         if(!result) 
         {
            return res.redirect(`/dashboard/${currentUser.username}?updated=0`);
         }

         if(result.error === 'username_exists') 
         {
            return res.redirect(`/dashboard/${currentUser.username}?updated=0`);
         }

         const { updated, currentUser: updatedUser } = result;
      
      anyUpdate = updated;

      if(currentUser.role > 2) 
      {
         const usersUpdates = [];

         for(const key in req.body) 
         {
            const passwordMatch = key.match(/^password_(\d+)$/);
            const welcomeTextMatch = key.match(/^welcomeText_(\d+)$/);

            if(passwordMatch) 
            {
               const userId = parseInt(passwordMatch[1]);
               
               if(userId !== currentUser.id) 
               {
                  let userUpdate = usersUpdates.find(u => u.id === userId);
                  
                  if(!userUpdate) 
                  {
                     userUpdate = { id: userId, updates: {} };
                     usersUpdates.push(userUpdate);
                  }
                  
                  userUpdate.updates.password = req.body[key];
               }
            }

            if(welcomeTextMatch) 
            {
               const userId = parseInt(welcomeTextMatch[1]);
               
               if(userId !== currentUser.id) 
               {
                  let userUpdate = usersUpdates.find(u => u.id === userId);
                  
                  if(!userUpdate) 
                  {
                     userUpdate = { id: userId, updates: {} };
                     usersUpdates.push(userUpdate);
                  }
                  
                  userUpdate.updates.welcomeText = req.body[key];
               }
            }
         }

         if(usersUpdates.length > 0) 
         {
            const otherUsersResult = await LoginDB.changeUsersInformation(usersUpdates);
            
            if(otherUsersResult.updated) 
            {
               anyUpdate = true;
            }
         }
      }

      req.session.user = {
         id: updatedUser.id,
         username: updatedUser.username,
         welcomeText: updatedUser.welcomeText,
         role: updatedUser.role
      };

         if(anyUpdate)
         {
            res.redirect(`/dashboard/${updatedUser.username}?updated=1`);
         } 
         else 
         {
            res.redirect(`/dashboard/${updatedUser.username}?updated=0`);
         }

         return;
      } catch(error) {
         console.error('Erreur lors de la modification:', error);
         return res.redirect(`/dashboard/${currentUser.username}?updated=0`);
      }
   }

   // Log Out
   if('dbLogOutSubmit' in req.body) 
   {
      const activeSessions = req.app.get('activeSessions');
      if(activeSessions) 
      {
         activeSessions.delete(currentUser.id);
      }

      req.session = null;
      return res.redirect('/');
   }

   return res.redirect(`/dashboard/${currentUser.username}`);
});

module.exports = router;