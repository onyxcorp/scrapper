
function userAgentSpinner() {

    var availableCrawlerUserAgents = [
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', // Googlebot
        'Googlebot/2.1 (+http://www.googlebot.com/bot.html)',   // Googlebot
        'Googlebot/2.1 (+http://www.google.com/bot.html)',  // Googlebot
        'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',  // Bingbot
        'Mozilla/5.0 (compatible; bingbot/2.0 +http://www.bing.com/bingbot.htm)'    // Bingbot
    ];

    var availableBrowsersUserAgents = [
        'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',     // Chrome 41.0.2228.0
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36',  // Chrome 41.0.2227.1
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36', // Chrome 40.0.2214.93
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36',  // Chrome 37.0.2062.124
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.67 Safari/537.36', // Chrome 36.0.1985.67

        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1', // Firefox 40.1
        'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0', // Firefox 36.0
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0', // Firefox 33.0
        'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0',  // Firefox 31.0


        'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko', // Internet Explorer 11.0
        'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0;  rv:11.0) like Gecko', // Internet Explorer 11.0

        // TODO make sure that the sites are not rendering different markup for internet explorer versions under 11
        'Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0', // Internet Explorer 10.6
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 7.0; InfoPath.3; .NET CLR 3.1.40767; Trident/6.0; en-IN)', // Internet Explorer 10.0
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)', // Internet Explorer 10.0
        'Mozilla/5.0 (compatible; MSIE 10.0; Macintosh; Intel Mac OS X 10_7_3; Trident/6.0)',  // Internet Explorer 10.0

    ];

    var randomNumber = Math.random() * (0 - 5) + min;

    return availableCrawlerUserAgents[randomNumber];
}

module.exports = userAgentSpinner;
