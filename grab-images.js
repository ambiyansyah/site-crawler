require('console-stamp')(console, '[HH:MM:ss.l]');

var fs = require('fs');
var mysql = require('mysql');
var gis = require('./lib-image');
var translate = require('node-google-translate-skidz');

var db = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
var con = mysql.createConnection(db);
var lang = process.argv[2];

// console.log(lang);
searchImage();

function searchImage() {
    con.query('SELECT * FROM keywords_en WHERE status = "1" LIMIT 1', function (err, keywords) {
        if (err) {
            console.error(err);

            setTimeout(function () {
                searchImage();
            }, 3000);
        } else {
            console.log('search images => ' + keywords[0].title);

            /* translate({
                text: keywords[0].title,
                source: 'en',
                target: lang
            }, function (translated) {
                console.log('translated to => ' + translated.translation);

                var opts = {
                    searchTerm: translated.translation,
                    queryStringAddition: '&tbs=isz:lt,islt:svga'
                };

                gis(opts, function (error, results) {
                    if (error) {
                        console.error(error);

                        setTimeout(function () {
                            searchImage();
                        }, 3000);
                    } else {
                        if (results && results.length > 50 && results[13].url) {
                            console.log('total images found => ' + results.length);

                            var content = JSON.stringify(results);
                            var sql = "REPLACE INTO keywords_de (title, content) VALUES ?";
                            var values = [
                                [translated.translation, content]
                            ];

                            con.query(sql, [values], function (err, result) {
                                if (err) throw err;

                                console.log("Number of records inserted => " + result.affectedRows);

                                var sql = "UPDATE keywords SET status = '1' WHERE id = '" + keywords[0].id + "'";

                                con.query(sql, function (err, result) {
                                    if (err) throw err;

                                    console.log("Record(s) updated => " + result.affectedRows);

                                    setTimeout(function () {
                                        searchImage();
                                    }, 3000);
                                });
                            });
                        } else {
                            var sql = "UPDATE keywords SET status = '1' WHERE id = '" + keywords[0].id + "'";

                            con.query(sql, function (err, result) {
                                if (err) throw err;

                                console.log("Record(s) updated => " + result.affectedRows);

                                setTimeout(function () {
                                    searchImage();
                                }, 3000);
                            });
                        }
                    }
                });
            }); */
        }
    });
}