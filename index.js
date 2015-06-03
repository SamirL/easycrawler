var _ = require('underscore');
var request = require('request');
var Url = require('url');

function Crawler(opts){
	
	this.thread = opts.thread || 5;
	this.headers = opts.headers || {};
	this.depth = opts.depth || 1; 
	this.logs = opts.logs || false;
	this.onSuccess = opts.onSuccess;
	this.onError = opts.onError;
	this.onFinished = opts.onFinished;

	this.inQueue = [];
	this.crawledUrls = [];
	this.discoveredUrls = [];
	this.active = [];
}


Crawler.prototype.log = function(status, url){
	if(this.logs)
		console.log('status : ', status, url);
}

Crawler.prototype.full = function(){
	return this.active.length >= this.thread;
}


Crawler.prototype.dequeue = function(){
	var next  = this.inQueue.shift();
	if(next){
		this.log('Dequeued : ', next.url);
		this.log("Loading url : ", next.url);
		this.load(next.url, next.depth);
	} else if(this.active.length == 0 && !next){
		this.log('Finished crawling :', '');
		
		if(this.onFinished){
			this.onFinished({crawled : this.crawledUrls, discovered : this.discoveredUrls});
		}
		
	}
}

Crawler.prototype.alreadyQueued = function(url){
	for (var i = 0; i < this.inQueue.length; i++) {
		if(this.inQueue[i].url == url){
			return true;
		}
	}
}

Crawler.prototype.alreadyCrawled = function(url){
	for (var i = 0; i < this.crawledUrls.length; i++) {
		if(this.crawledUrls[i] == url){
			return true;
		}
		
	};
}


Crawler.prototype.queue = function(url, depth){
	if(this.full() && !this.alreadyQueued(url) && !this.alreadyCrawled(url) && depth > 0){
		this.log('Adding url to queue : ', url);
		this.inQueue.push({url: url, depth : depth});
	} else if(this.alreadyCrawled(url)){
		this.log('Url already crawled : ', url );
	} else if(this.alreadyQueued(url) || depth < 1) {
		this.log('Url already exits or no depth :', url);
	} else {
		this.load(url, depth);
	}
}

Crawler.prototype.finished = function(url){
	var i = this.active.indexOf(url);
	this.active.splice(i, 1);
	
	if(!this.full()){
		this.dequeue();
	} 
}


Crawler.prototype.getLinks = function(baseUrl, body){
	var regex = /<a[^>]+?href=".*?"/gm;
 	var links = body.match(regex);

 	links = _.map(links, function(link){
 		var match = /href=\"(.*?)[#\"]/.exec(link);

 		link = match[1];
 		link = Url.resolve(baseUrl, link);
 		return link;
 	});

 	return _.chain(links)
 		.uniq()
 		.value();

}

Crawler.prototype.load = function(url, depth) {
	this.log('Loading url : ', url);
	this.active.push(url);
	request({url : url,headers : this.headers}, function(error, response, body){
		if(!error && response.statusCode === 200){
			if(this.onSuccess){
				this.onSuccess({
					url : url,
					status : response.statusCode,
					content : body,
					response : response,
					body : body 
				});
			}
			this.log('Url successfully loaded', url);
			this.crawledUrls.push(url);
		 	_.each(this.getLinks(url, body), function(link){
		 		this.discoveredUrls.push(link);
		 		this.queue(link, depth - 1);
		 	}.bind(this));
				
		}else if(error){
			this.log('Error occured', error);
			if(this.onError){
				this.onError({
					url : url,
					status : response.statusCode,
					error : error,
					content : body,
					response : response,
					body : body 
				});
			}	
		}

		this.finished(url);
	}.bind(this));
}

Crawler.prototype.crawl = function(url){
	this.log('Starting crawl :', url);
	// console.log(this.depth);
	this.queue(url, this.depth);

}

module.exports = Crawler;