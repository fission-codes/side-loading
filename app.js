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

const updateHref = (base, url) => {
  console.log("base: ", base);
  console.log("url: ", url);
  console.log("document.baseURI: ", document.baseURI);
  console.log("toReturn: ", url.replace(document.baseURI, base));
  return url.replace(document.baseURI, base);
};

const reloadAll = (parent, tagName, baseURL) => {
  const collection = parent.getElementsByTagName(tagName);
  for (let i = 0; i < collection.length; i++) {
    const node = collection[i];
    const newNode = node.cloneNode(true);
    if (node.href) {
      newNode.href = updateHref(baseURL, node.href);
    }
    if (node.src) {
      newNode.src = updateHref(baseURL, node.src);
    }
    node.parentElement.replaceChild(newNode, node);
  }
};

const replaceHTML = (url, html) => {
  var doc = document.createElement("html");
  doc.innerHTML = html;

  const head = doc.getElementsByTagName("head")[0];
  if (head) {
    head.childNodes.forEach(n => {
      n.baseURI = url;
      if (n.href) {
        n.href = updateHref(url, n.href);
      }
      if (n.src) {
        n.src = updateHref(url, n.src);
      }
      document.head.appendChild(n);
    });
  }

  const body = doc.getElementsByTagName("body")[0];
  if (body) {
    const toReload = ["script", "img", "link", "a"];
    toReload.forEach(tag => reloadAll(body, tag, url));
    document.body = body;
  }
};

const loadPage = async url => {
  const pageContent = await getContent(url);
  replaceHTML(url, pageContent);
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

// const run = async () => {
//   const pageContent = await getContent();
//   replaceHTML(pageContent);
//   // console.log("page reloaded");
//   // setTimeout(() => {
//   //   console.log("Ipfs still available: ", isIpfsAvailable());
//   // }, 3000);
// };

// run();
