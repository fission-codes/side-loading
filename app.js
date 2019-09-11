const CORS_PROXY = "https://cors-anywhere.herokuapp.com";

const getContent = url => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(new Error(xhr.statusText));
      }
    };
    const proxyURL = `${CORS_PROXY}/${url}`;
    xhr.open("GET", proxyURL, true);
    xhr.send();
  });
};

const getHostname = url => {
  const tmp = document.createElement("a");
  tmp.href = url;
  return `https://${tmp.hostname}/`;
};

const updateHref = (hostname, url) => {
  const baseURI = document.baseURI.substring(
    0,
    document.baseURI.lastIndexOf("/") + 1
  );
  const domainURI = document.baseURI.substring(
    0,
    document.baseURI.indexOf(document.domain) + document.domain.length + 1
  );

  return url.replace(baseURI, hostname).replace(domainURI, hostname);
};

const reloadAll = (parent, tagName, hostname) => {
  const collection = parent.getElementsByTagName(tagName);
  for (let i = 0; i < collection.length; i++) {
    const node = collection[i];
    const newNode = node.cloneNode(true);
    if (node.href) {
      newNode.href = updateHref(hostname, node.href);
    }
    if (node.src) {
      newNode.src = updateHref(hostname, node.src);
    }

    node.parentElement.replaceChild(newNode, node);
  }
};

const replaceHTML = (hostname, html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.head.childNodes.forEach(n => {
    const newNode = n.cloneNode(true);
    if (n.href) {
      newNode.href = updateHref(hostname, n.href);
    }
    if (n.src) {
      newNode.src = updateHref(hostname, n.src);
    }
    document.head.appendChild(newNode);
  });

  const body = doc.getElementsByTagName("body")[0];
  if (body) {
    const toReload = ["script", "img", "link", "a"];
    toReload.forEach(tag => reloadAll(body, tag, hostname));
    document.body = body;
  }
};

const loadPage = async url => {
  const pageContent = await getContent(url);
  const hostname = getHostname(url);
  replaceHTML(hostname, pageContent);
};

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("load-form");
  form.addEventListener("submit", evt => {
    evt.preventDefault();
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
