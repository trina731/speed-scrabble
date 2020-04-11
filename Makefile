all:
	browserify client/client.js -o client/bundle.js
	node app.js