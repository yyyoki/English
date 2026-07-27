(function () {
  var SURVEY_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx1hdlpUxjZKSPUw_PtQ4jZoWnpkaMS1AbwHtkTVSaOTP6OJQZ4s07woWp5JND64LGUkA/exec';

  var modal = document.getElementById('cta-modal');
  var modalCard = modal.querySelector('.modal-card');
  var screenSurvey = document.getElementById('screen-survey');
  var screenLine = document.getElementById('screen-line');
  var surveyForm = document.getElementById('survey-form');
  var surveyError = document.getElementById('survey-error');
  var surveySubmit = surveyForm.querySelector('button[type="submit"]');
  var lineHeading = document.getElementById('line-heading');
  var openTriggers = document.querySelectorAll('[data-cta-open]');
  var closeTriggers = modal.querySelectorAll('[data-cta-close]');

  var lastFocusedElement = null;

  function getFocusable() {
    return modalCard.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  function openModal(trigger) {
    lastFocusedElement = trigger;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    surveyForm.reset();
    surveyError.hidden = true;
    surveySubmit.disabled = false;
    showScreen(screenSurvey);
    modalCard.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function showScreen(screen) {
    screenSurvey.hidden = screen !== screenSurvey;
    screenLine.hidden = screen !== screenLine;
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key === 'Tab') {
      var focusable = getFocusable();
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  openTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openModal(trigger);
    });
  });

  closeTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  surveyForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var q1Answered = surveyForm.querySelector('input[name="q1"]:checked');
    var q2Answered = surveyForm.querySelector('input[name="q2"]:checked');

    if (!q1Answered || !q2Answered) {
      surveyError.hidden = false;
      return;
    }

    surveyError.hidden = true;
    surveySubmit.disabled = true;

    fetch(SURVEY_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        q1: q1Answered.value,
        q2: q2Answered.value
      })
    }).catch(function () {
      // no-cors: レスポンス内容は検証できないため、送信の成否に関わらず次の画面へ進む
    }).finally(function () {
      surveySubmit.disabled = false;
      showScreen(screenLine);
      lineHeading.focus();
    });
  });
})();
