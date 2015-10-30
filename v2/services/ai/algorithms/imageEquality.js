/**
 *
 *  This service is intended to be used to assert the equality between two
 *  distinct images that were collected from the scrapper
 *
 *  The algorithm being used is calculating the HAMMING DISTANCE of the PHASH from the image
 *  references
 *  http://www.phash.org/
 *  https://en.wikipedia.org/wiki/Hamming_distance
 */

var phash = require('phash-image'),
    hammingDistance = require('hamming-distance'),
    gm = require('gm').subClass({ imageMagick: true }),
    imagesFolder = '../images/';

function getImageLink(filename) {
    return imagesFolder + filename;
}

gm(getImageLink('whey-protein-on-megaforma.jpg'))
.fuzz(10)   // allow for certain flexibility in the color match
.trim()     // get the fuzzed image and trim some repetitive/white parts
.write('./images/whey-protein-on-megaforma-croped-gm.jpg', function (err) {
    if (!err) {
        console.log('write successfuly');
    } else {
        console.log(err);
    }
});

gm(getImageLink('whey-protein-on-corpoideal.jpg'))
.fuzz(10)
.trim()
.write('../images/whey-protein-on-corpoideal-croped-gm.jpg', function (err) {
    if (!err) {
        console.log('write successfuly');
    } else {
        console.log(err);
    }
});

gm(getImageLink('whey-protein-on-madrugao.jpg'))
.fuzz(10)
.trim()
.write('../images/whey-protein-on-madrugao-croped-gm.jpg', function (err) {
    if (!err) {
        console.log('write successfuly');
    } else {
        console.log(err);
    }
});

// with a callback
phash(getImageLink('whey-protein-on-corpoideal-croped-gm.jpg'))
.then( function (firstImageHash) {

    phash(getImageLink('whey-protein-on-madrugao-croped-gm.jpg'))
    .then( function (secondImageHash) {
        console.log('(equal) 1 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
    });

    phash(getImageLink('whey-protein-integralmedica.jpg'))
    .then( function (secondImageHash) {
        console.log('(same color) 2 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
    });

    phash(getImageLink('whey-protein-ultimamte-corpoideal.jpg'))
    .then( function (secondImageHash) {
        console.log('3 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
    });

    phash(getImageLink('images/whey-protein-universal-corpoideal.jpg'))
    .then( function (secondImageHash) {
        console.log('4 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
    });

    phash(getImageLink('images/bcaa.jpg'))
    .then( function (secondImageHash) {
        console.log('(Bcaa) 5 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
    });

    phash(getImageLink('images/max-top-whey.jpg'))
    .then( function (secondImageHash) {
        console.log('(pote igual mas azul) 6 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
    });

    phash(getImageLink('whey-protein-on-megaforma-croped-gm.jpg'))
    .then( function (secondImageHash) {
        console.log('(second equal) 7 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
    });

});
