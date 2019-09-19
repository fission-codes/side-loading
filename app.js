const fetchIPLD = async (cid) => {
  const ipfs = await getIpfs.default()
  await ipfs.swarm.connect("/dns4/ipfs.runfission.com/tcp/4003/wss/ipfs/QmVLEz2SxoNiFnuyLpbXsH6SvjPTrHNMU88vCQZyhgBzgw")
  const resp = await ipfs.get(cid)
  if(resp.length === 1){
    return resp[0].content
  }
  const toFetch = resp.filter(node => node.type === "file")
  const filenames = toFetch.map(node => node.path.replace(`${cid}/`, ''))
  const contents = await Promise.all(
    toFetch.map(node => ipfs.get(node.hash))
  )
  const result = filenames.reduce((acc, curr, i)=>{
    acc[curr] = contents[i][0].content
    return acc
  },{})
  return result
}

const getMimeType = (file) => {
  if(file.endsWith('gif')){
    return 'image/gif'
  }else if(file.endsWith('js')){
    return 'application/javascript'
  }else if(file.endsWith('css')){
    return 'text/css'
  }
  return 'application/octet-stream'
}

const getURLForPath = (ipld, path) => {
  const bytes = ipld[path]
  if(!bytes){
    return path
  }
  const type = getMimeType(path)
  const file = new window.Blob([bytes], { type })
  const fileURL = window.URL.createObjectURL(file)
  return fileURL
}

const getResourceForLocation = (ipld, loc) => {
  if(loc === '' || loc === '/'){
    loc = 'index.html'
  }
  return ipld[loc]
}

const decodeUint8Arr = (arr) => (
  !!arr ? new TextDecoder("utf-8").decode(arr) : undefined
)

const reloadAll = (parent, tagName, ipld) => {
  const collection = parent.getElementsByTagName(tagName)
  let toDelete = []
  let toAdd = []
  for (let i=0; i<collection.length; i++){
    const node = collection[i]
    const newNode = recreateNode(ipld,node)
    if (tagName === "script" || tagName === "link") {
      toDelete.push(node)
      toAdd.push(newNode)
    } else {
      node.parentElement.replaceChild(newNode, node);
    }
  }

  toDelete.forEach(n => {
    n.parentNode.removeChild(n);
  });
  toAdd.forEach(n => {
    document.body.appendChild(n)
  })
}

const recreateNode = (ipld, node) => {
  const newNode = document.createElement(node.localName);
  const attrs = node.attributes;
  if (attrs) {
    for (let i = 0; i < attrs.length; i++) {
      newNode.setAttribute(attrs[i].nodeName, attrs[i].nodeValue);
    }
  }

  if(newNode.getAttribute('src')){
    const newSrc = getURLForPath(ipld, newNode.getAttribute('src'))
    newNode.setAttribute('src', newSrc)
  }
  if(newNode.getAttribute('href')){
    const newHref = getURLForPath(ipld, newNode.getAttribute('href'))
    newNode.setAttribute('href', newHref)
  }

  newNode.innerHTML = node.innerHTML;
  return newNode;
};

const replaceHTML = (ipld) => {
  const page = document.location.pathname
  const pageContent = decodeUint8Arr(getResourceForLocation(ipld, page))
  const parser = new DOMParser();
  const doc = parser.parseFromString(pageContent, "text/html");

  doc.head.childNodes.forEach(n => {
    const newNode = recreateNode(ipld, n);
    document.head.appendChild(newNode);
  });

  document.body = doc.body.cloneNode(true);

  const toReload = ["img", "link", "a", "scripts"]
  toReload.forEach(tag => reloadAll(document.body, tag, ipld));
};

const emitDomLoaded = () => {
  contentLoaded = true;
  var DOMContentLoaded_event = document.createEvent("Event");
  DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
  window.document.dispatchEvent(DOMContentLoaded_event);
  var WindowLoad_event = document.createEvent("Event");
  WindowLoad_event.initEvent("load", true, true);
  window.dispatchEvent(WindowLoad_event);
};

const loadPage = async cid => {
  const ipld = await fetchIPLD(cid)
  console.log('ipld: ', ipld)
  replaceHTML(ipld);
  emitDomLoaded();
};

// const addScripts = scripts => {
//   if (scripts.length < 1) {
//     return;
//   }
//   const node = scripts[0];
//   const toAdd = scripts.slice(1);
//   if (!!node.src) {
//     node.onload = () => {
//       addScripts(toAdd);
//     };
//     document.body.appendChild(node);
//   } else {
//     document.body.appendChild(node);
//     addScripts(toAdd);
//   }
// };

