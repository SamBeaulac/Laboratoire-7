const IDLE_MS = 1 * 60 * 1000;

$(document).ready(function () {
  let idleTimer;

  function onIdle() {
    alert('Inactivité détectée.');
    $.post('/logout')
      .always(function () {
        window.location.href = '/';
      })
      .fail(function (err) {
        console.error('Logout failed', err);
      });
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(onIdle, IDLE_MS);
  }

  $(document).on('mousemove keydown scroll click touchstart', resetIdleTimer);
  resetIdleTimer();
});