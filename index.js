var Requester = require('requester'),
	requester = new Requester({
		headers: {headers: {'User-Agent': 'PhantomJS'}},
		debug: 0
	}),
	PromiseObject = require('promise-object'),
	when = require('whenplus'),
	spawn = require('child_process').spawn,
	fs = require('fs'),
	url = require('url'),
	GenericPool = require('generic-pool');

module.exports = function ($config) {
	var userAgentMatch = $config.userAgentMatch || function () { return false; },
		routeMatch = $config.routeMatch || function () { return true; },
		host = $config.host,
		portPool = $config.portPool.slice(0),
		timeout = $config.timeout || 10000,
		log = $config.log || false,
		phantomOptions = $config.phantomOptions || ['--load-images=no', '--disk-cache=yes', '--web-security=no'];

	var pool = GenericPool.Pool({
		name: 'phantom',
		create: function(callback) {
			var port = portPool.shift();

			var phantom = spawn('phantomjs', phantomOptions.concat([__dirname + '/phantom', port, timeout]));
			phantom.port = port;
			phantom.stdout.on('data', function (data) {
				if (data.toString().trim() === 'ready') {
					if (log) console.log('phantom server ready at', port);
					callback(null, phantom);
				}
			});

			phantom.stderr.on('data', function (data) {
				if (log) console.log('stderr: ' + data);
				pool.destroy(phantom);
				callback(data);
			});

			phantom.on('close', function (code) {
				if (log) console.log('child process exited with code ' + code);
			});
		},
		destroy: function(client) {
			portPool.push(client.port);
			client.kill();
		},
		min: 1,
		max: portPool.length,
		idleTimeoutMillis: 60000,
		log: $config.log
	});

	return function (request, response, next) {

		var userAgent = request.headers['user-agent'] || '',
			requestUrl = url.format({
				host: host,
				pathname: request.path,
				protocol: request.connection.encrypted ? 'https' : 'http',
				query: request.query
			});

		if (userAgent.match(/PhantomJS/i)) {
			next();
		} else if (!userAgentMatch(userAgent) || !routeMatch(requestUrl) || (request.path === '/favicon.ico')) {
			next();
		} else {
			pool.acquire(function(error, phantom) {
				if (error) {
					if (log) console.log(error);
				} else {
					var start = new Date();

					requester.post(
						'http://localhost:' + phantom.port,
						{
							data: {
								url: requestUrl
							}
						},
						function (body) {
							if (this.statusCode) {
								response.send(body);
							} else {
								response.send();
							}

							pool.release(phantom);
						}
					);
				}
			});
		}
	};
};