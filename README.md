Easy Crawler
========

A simple webcrawler for Node.js supporting Concurrent Connections and Queues.

## Installation

		npm install easy-crawler

## Usage
```javascript
var Crawler = require('easy-crawler');

var crawler = new Crawler({
	thread: 5,
	logs: true,
	depth: 2,
	headers : {'user-agent' : 'easy-scraper'},
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


crawler.crawl('http://www.test.com/');
```