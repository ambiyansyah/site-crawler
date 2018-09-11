var Crawler = require("simplecrawler");
var cheerio = require('cheerio');
var mysql = require('mysql');
var fs = require('fs');
var url = require('url');
var randomua = require('random-user-agent');

// create configuration
var tools = require('./tools');
var db = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
var con = mysql.createConnection(db);
var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var search_for = config.search_for.split(',');
var site = process.argv[2];
var title_tag = process.argv[3];
var category_tag = process.argv[4];

// create connection to database
con.connect(function (err) {
    if (err) {
        console.error(err);

        process.exit();
    } else {
        console.log("Connected to database!");
    }
});

var crawler = Crawler(site)
    .on("fetchcomplete", function (queueItem, responseBuffer, response) {
        console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
        console.log("It was a resource of type %s", response.headers['content-type']);

        var $ = cheerio.load(responseBuffer.toString("utf8"), {
            normalizeWhitespace: true
        });

        $(title_tag).map(function (i_title, el_title) {
            var title = $(el_title).text().trim();

            if (title && title.length > 20 && !tools.is_blacklist(title, search_for)) {
                var category = $(category_tag).map(function (i_category, el_category) {
                    return $(el_category).text();
                }).get().join(' ');

                if (category.replace(/\s/g,'') !== '') {
                    // console.log(title);
                    // console.log(category.replace(/\s/g,''));

                    var sql = "REPLACE INTO keywords_en (domain, link, category, title, status) VALUES ?";
                    var values = [
                        [
                            url.parse(queueItem.url).hostname,
                            url.parse(queueItem.url).pathname,
                            category.replace(/\s/g,','),
                            title,
                            '1'
                        ]
                    ];
    
                    con.query(sql, [values], function (err, result) {
                        if (err) throw err;
                        console.log("Number of records inserted: " + result.affectedRows);
                    });
                }
            }
        });
    });

// crawler.interval = 1000;
// crawler.maxConcurrency = 3;
crawler.maxDepth = 5;
crawler.domainWhitelist = [url.parse(site).hostname];
crawler.respectRobotsTxt = true;
crawler.userAgent = randomua("desktop");

crawler.start();