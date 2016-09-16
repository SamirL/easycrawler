Easy Crawler
========

A simple webcrawler for Node.js supporting Concurrent Connections and Queues.

## Installation

	npm install easycrawler

## Usage
```javascript
var Crawler = require('easycrawler');

var crawler = new Crawler({
	thread: 5,
	logs: true,
	depth: 2,
	headers : {'user-agent' : 'foobar'},
	onlyCrawl : ['reddit', 'reddit.com'], //will only crawl urls containing these strings
	reject : ['rutube'], //will reject links containing rutube
	onSuccess : function(data){
		//console.log(data.url);
		//console.log(data.body);
	},
	onError : function(data){
		//console.log(data.url);
		//console.log(data.status);
	},
	onFinished : function(urls){
		//console.log(urls.crawled);//urls.crawled for visited urls;
		//console.log(urls.discovered);//urls.discovered for discovered urls
	}
});


crawler.crawl('http://www.reddit.com/');
```
