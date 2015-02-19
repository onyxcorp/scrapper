
var Scheduler = require('node-schedule'),
    async = require('async'),
    taxonomyWorker = require('./workers/TaxonomyWorker'),
    productWorker = require('./workers/ProductWorker'),
    offerWorker = require('./workers/OfferWorker'),
    reviewWorker = require('./workers/ReviewWorker'),
    memberWorker = require('./workers/MemberWorker'),
    logsData = require('./data/LogsData'),
    schedule,
    job,
    updater,
    debug = function (message) { console.log(message); };

schedule = new Scheduler.RecurrenceRule();
schedule.hour = 02;
schedule.minute = 30;

job = Scheduler.scheduleJob(schedule, function () {
    console.log('later change me and use the updater function bellow');
});

// to invalidate the job above
job.cancel();

var elapsedTime = 0;
var stopwatch = setInterval(function () {
    elapsedTime = elapsedTime + 1;
}, 1000);

updater = function () {
    // utilizar ASYNC waterfall com os dois métodos abaixo
    async.waterfall([
        taxonomyWorker,
        productWorker, // first update the product from buscape API
        offerWorker
        // reviewWorker,
        // memberWorker   // then update the packages information
    ], function (err, result) {
        if (err) {
            logsData.save('Updater', 'There was an error with one of the workers today, aborting...', function (err) {
                clearInterval(stopwatch);
                debug(elapsedTime + ' seconds');
                debug(err);
            });
        } else {
            clearInterval(stopwatch);
            logsData.save('Updater', 'All done in ' + elapsedTime + ' seconds', function (err) {
                debug('Updater.js - All done in ' + elapsedTime + ' seconds');
            });
        }
    });
};

updater();
