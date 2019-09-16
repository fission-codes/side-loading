# Content Side Loading

Experimenting with content side loading for Fission Live.

### To run:
Use your favorite http server to serve index.html
(ie `live-server`)

### Current process:
- block `window.load` an `document.DOMContentLoaded` events
- get html content of page through `cors-anywhere` proxy
- parse html content
- loop through `<head>` nodes, for each:
  - recreate node on document (must do this in order for page to load content)
  - update href/src to point to original site instead of current hostname
  - append child to new document's head
- set new document's body to a deep clone of `<body>`
  - recreate all nodes that point to outside content (`img`, `link`, `a`)
    - update href/src
    - add to document with `replaceChild` since order matters
  - recreate all script nodes
    - update href/src
    - delete all scripts in the body
    - add all recreate scripts to the end of body
      - currently do this recursively (only add the next script once the previous is loaded to make sure they're loaded in order but we'll want to change that to be more efficient)
- emit `document.DOMContentLoaded` and `window.load` events

### Current issues/questions:
- CORs
  - doesn't seem to affect most assets, only fonts
  - shouldn't be an issue for our use case
- Event orders
	- we're hijacking `window.load` and `document.DOMContentLoaded` events
    - any downstream effects of this?
    - anything else we have to spoof to simulate page load? This is sufficient for jQuery at least
    - could anything be triggered by these events before they reach out blocker script? Browser? Extensions? 
	- right now inserting deep clones of most dom nodes except those that reference outside content (img, src, link, a)
    - do deep clones mess up `ready` events on elements
