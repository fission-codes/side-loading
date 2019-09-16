$(document).ready(() => {
  console.log("docuemnt ready");
});

const fakeEvents = () => {
  var DOMContentLoaded_event = document.createEvent("Event");
  DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
  window.document.dispatchEvent(DOMContentLoaded_event);
};

setTimeout(() => {
  contentLoaded = true;
  fakeEvents();
}, 2000);
