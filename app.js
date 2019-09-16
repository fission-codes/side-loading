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
  // get base domain name with http/https
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
    // replaceChild doesn't trigger content load
    // replace nodes where location matters but append scripts/links
    if (tagName === "script" || tagName === "link") {
      node.parentElement.removeChild(node);
      document.body.appendChild(newNode);
    } else {
      node.parentElement.replaceChild(newNode, node);
    }
  }
};

const recreateNode = node => {
  const newNode = document.createElement(node.localName);
  const attrs = node.attributes;
  if (attrs) {
    for (let i = 0; i < attrs.length; i++) {
      newNode.setAttribute(attrs[i].nodeName, attrs[i].nodeValue);
    }
  }
  newNode.innerHTML = node.innerHTML;
  return newNode;
};

const replaceHTML = (hostname, html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.head.childNodes.forEach(n => {
    const newNode = recreateNode(n);
    if (n.href) {
      newNode.href = updateHref(hostname, n.href);
    }
    if (n.src) {
      newNode.src = updateHref(hostname, n.src);
    }
    document.head.appendChild(newNode);
  });

  document.body = doc.body.cloneNode(true);

  const toReload = ["img", "link", "a"];
  toReload.forEach(tag => reloadAll(document.body, tag, hostname));

  const scripts = document.body.getElementsByTagName("script");
  let toAdd = [];
  let toDelete = [];

  for (let i = 0; i < scripts.length; i++) {
    const n = scripts[i];
    const newNode = recreateNode(n);
    if (n.src) {
      newNode.src = updateHref(hostname, n.src);
    }

    toDelete.push(n);
    toAdd.push(newNode);
  }

  toDelete.forEach(n => {
    n.parentNode.removeChild(n);
  });

  // makes sure to add scripts in order. switch this out for something more efficient later
  addScripts(toAdd);

  emitDomLoaded();
};

const emitDomLoaded = () => {
  contentLoaded = true;
  var DOMContentLoaded_event = document.createEvent("Event");
  DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
  window.document.dispatchEvent(DOMContentLoaded_event);
};

const addScripts = scripts => {
  if (scripts.length < 1) {
    return;
  }
  const node = scripts[0];
  const toAdd = scripts.slice(1);
  if (!!node.src) {
    node.onload = () => {
      addScripts(toAdd);
    };
    document.body.appendChild(node);
  } else {
    document.body.appendChild(node);
    addScripts(toAdd);
  }
};

const loadPage = async url => {
  const pageContent = await getContent(url);
  const hostname = getHostname(url);
  replaceHTML(hostname, pageContent);
};
