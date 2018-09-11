var request = require('request');
var cheerio = require('cheerio');
var randomUA = require('random-user-agent');

var baseURL = 'http://images.google.com/search?tbm=isch&q=';

function gis(opts, done) {
    var searchTerm;
    var queryStringAddition;
    var filterOutDomains;

    if (typeof opts === 'string') {
        searchTerm = opts;
    } else {
        searchTerm = opts.searchTerm;
        queryStringAddition = opts.queryStringAddition;
        filterOutDomains = opts.filterOutDomains;
    }

    var url = baseURL + searchTerm;

    if (filterOutDomains) {
        url += encodeURIComponent(' ' + filterOutDomains.map(addSiteExcludePrefix).join(' '));
    }

    if (queryStringAddition) {
        url += queryStringAddition;
    }
    var reqOpts = {
        url: url,
        headers: {
            'User-Agent': randomUA('desktop')
        }
    };

    // console.log(reqOpts.url);
    request(reqOpts, parseGISResponse);

    function parseGISResponse(error, response, body) {
        if (error) {
            done(error);
        } else {
            var $ = cheerio.load(body);
            var metaLinks = $('.rg_meta');
            var gisURLs = [];

            if (!metaLinks[0]) {
                var reqOpts = {
                    url: url,
                    headers: {
                        'User-Agent': randomUA('desktop')
                    }
                };
            
                request(reqOpts, parseGISResponse);        
            } else {
                metaLinks.each(collectHref);
            }

            if (gisURLs.length > 1) {
                done(error, gisURLs);
            } else {
                if (!$('.mnr-c')) {
                    var spells = $('.spell');

                    spells.each(function(i, element) {
                        if (element.attribs.href) {
                            var rereqOpts = {
                                url: 'http://images.google.com/' + element.attribs.href,
                                headers: {
                                    'User-Agent': randomUA('desktop')
                                }
                            };

                            request(rereqOpts, parseGISResponse);
                        }
                    });
                } else {
                    done(error);
                }
            }
        }

        function collectHref(i, element) {
            if (element.children.length > 0 && 'data' in element.children[0]) {
                var metadata = JSON.parse(element.children[0].data);
                if (metadata.ou) {
                    var result = { 
                        title: capitalize_Words((metadata.pt.replace(/\W/g, ' ')).replace(/  +/g, ' ')),
                        alt: (metadata.s.replace(/\W/g, ' ')).replace(/  +/g, ' '),
                        url: metadata.ou,
                        filetype: metadata.ity,
                        source: metadata.isu
                    };

                    if (domainIsOK(result.url)) {
                        gisURLs.push(result);
                    }
                }
            }
        }
    }

    function domainIsOK(url) {
        if (!filterOutDomains) {
            return true;
        } else {
            return filterOutDomains.every(skipDomainIsNotInURL);
        }

        function skipDomainIsNotInURL(skipDomain) {
            return url.indexOf(skipDomain) === -1;
        }
    }
}

function addSiteExcludePrefix(s) {
    return '-site:' + s;
}

function capitalize_Words(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

module.exports = gis;