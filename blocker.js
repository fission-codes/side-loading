let contentLoaded = false;

document.addEventListener("DOMContentLoaded", evt => {
  if (contentLoaded) {
    return;
  }

  evt.preventDefault();
  evt.stopImmediatePropagation();

  const form = document.getElementById("load-form");
  form.addEventListener("submit", submitEvt => {
    submitEvt.preventDefault();
    submitEvt.stopImmediatePropagation();
    const btn = document.getElementById("load-btn");
    btn.innerHTML = "Loading...";
    let toLoad = (document.getElementById("to-load") || {}).value;
    if (toLoad && toLoad.length > 0) {
      if (toLoad[toLoad.length - 1] !== "/") {
        toLoad += "/";
      }
      if (!toLoad.startsWith("http")) {
        toLoad = "https://" + toLoad;
      }
      loadPage(toLoad);
    }
  });
});

window.addEventListener("load", evt => {
  if (!contentLoaded) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
  }
});
