/**
 * @file expiration.js
 * @author Samuel Beaulac
 * @date 26/10/2025
 * @brief Gestion du timeout de session par inactivité
 */

const IDLE_MS = 2 * 60 * 1000;

$(document).ready(function () 
{
  if(!document.querySelector('.header__logout-button')) 
  {
    return;
  }
  
  let idleTimer;

  function onIdle() 
  {
    alert('Inactivité détectée.');
    $.post('/logout')
      .always(function() 
      {
        window.location.href = '/';
      })
      .fail(function(err) 
      {
        console.error('Logout failed', err);
      });
  }

  function resetIdleTimer() 
  {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(onIdle, IDLE_MS);
  }

  $(document).on('mousemove keydown scroll click touchstart', resetIdleTimer);
  resetIdleTimer();
});