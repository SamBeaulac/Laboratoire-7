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
      const updates = {};
      let anyUpdate = false;

      if(req.body.username)
      {
         updates.username = req.body.username;
      }

      if(req.body.password)
      {
         updates.password = req.body.password;
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
});

module.exports = router;