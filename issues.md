- CORs (shouldn't be an issue for our use case)
- Event orders
	- we're hijacking `window.load` and `document.DOMContentLoaded` events
	- any downstream effects of this?
	- anything else we have to spoof to simulate page load? This is sufficient for jQuery at least
	- right now inserting deep clones of most dom nodes except those that reference outside content (img, src, link, a)
	- do deep clones mess up `ready` events