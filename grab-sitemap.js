var sitemaps = require('sitemap-stream-parser');

var urls = ['http://feeds.feedburner.com/digsdigs']

all_urls = [];

sitemaps.parseSitemaps(urls, function(url) { all_urls.push(url) }, function(err, sitemaps) {
    console.log(all_urls);
    console.log('All done!');
});