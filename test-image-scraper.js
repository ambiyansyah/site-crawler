var Scraper = require ('images-scraper')
  , google = new Scraper.Google();
 
google.list({
    keyword: process.argv[2],
    num: 100,
    detail: true,
    nightmare: {
        show: false
    }
})
.then(function (res) {
    console.log('first 10 results from google', res);
}).catch(function(err) {
    console.log('err', err);
});
 
// you can also watch on events
google.on('result', function (item) {
    console.log('out', item);
});
