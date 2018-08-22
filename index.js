var Crawler = require("simplecrawler");
var cheerio = require('cheerio');
var mysql = require('mysql');
var fs = require('fs');
var db = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
var con = mysql.createConnection(db);
var url = require('url');
var randomua = require('random-user-agent');
var title_tag = process.argv[3];

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to database!");
});

var crawler = Crawler(process.argv[2])
    .on("fetchcomplete", function () {
        console.log("Fetched a resource!")
    });

crawler.interval = 1000;
crawler.maxConcurrency = 3;
crawler.maxDepth = 5;
crawler.domainWhitelist = [url.parse(process.argv[2]).hostname];
crawler.respectRobotsTxt = true;
crawler.userAgent = randomua("desktop");

crawler.on("fetchcomplete", function (queueItem, responseBuffer, response) {
    console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
    console.log("It was a resource of type %s", response.headers['content-type']);

    var $ = cheerio.load(responseBuffer.toString("utf8"));

    $(title_tag).map(function () {
        if ($(this).text().trim()) {
            var sql = "REPLACE INTO keywords (site, title) VALUES ?";
            var values = [
                [queueItem.url, $(this).text().trim()]
            ];

            con.query(sql, [values], function (err, result) {
                if (err) throw err;
                console.log("Number of records inserted: " + result.affectedRows);
            });
        }
    });
});

crawler.start();