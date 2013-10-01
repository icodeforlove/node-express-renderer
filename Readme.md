## express-renderer

Gives express the ability to render pages via phantomjs for SEO purposes.

## installation

    $ npm install express-renderer

## use

after you instantiate your app you can use the middle-ware like this

```javascript
app.use(require('express-renderer')({
	portPool: [18080,18081,18082,18083,18084], // required

	host: 'localhost:4321', // required

	userAgentMatch: function (userAgent) {
		return true;
	}

	// phantomOptions: ['--load-images=no', '--disk-cache=yes', '--web-security=no'],

	// log: true,

	// routeMatch: function () {
	// 	return true
	// }
}));
```

when a request fulfills the userAgentMatch, and the routeMatch the server will render the HTML

## advanced

if your page needs additional async tasks to be completed you can specify a ServerRendering method that can return true when everything is ready:

```javascript
window.ServerRendering = navigator.userAgent.match(/PhantomJS/);

if (window.ServerRendering) {
	window.ServerRenderingWaitFor = function () {
		return window.pageIsReady;
	};
}
```