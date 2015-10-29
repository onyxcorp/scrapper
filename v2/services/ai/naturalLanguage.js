var natural = require('natural'),
    tokenizer = new natural.WordTokenizer();

var phash = require('phash-image');
var hammingDistance = require('hamming-distance');

// var gm = require('gm').subClass({ imageMagick: true });
//
// gm('./images/whey-protein-on-megaforma.jpg')
// .fuzz(10)
// .trim()
// .write('./images/whey-protein-on-megaforma-croped-gm.jpg', function (err) {
//   if (!err) {
//     console.log('write successfuly');
//   } else {
//     console.log(err);
//   }
// });
//
// gm('./images/whey-protein-on-corpoideal.jpg')
// .fuzz(10)
// .trim()
// .write('./images/whey-protein-on-corpoideal-croped-gm.jpg', function (err) {
//   if (!err) {
//     console.log('write successfuly');
//   } else {
//     console.log(err);
//   }
// });
//
// gm('./images/whey-protein-on-madrugao.jpg')
// .fuzz(10)
// .trim()
// .write('./images/whey-protein-on-madrugao-croped-gm.jpg', function (err) {
//   if (!err) {
//     console.log('write successfuly');
//   } else {
//     console.log(err);
//   }
// });

// with a callback
var wheyCorpoIdeal = './images/whey-protein-on-corpoideal-croped-gm.jpg';
phash(wheyCorpoIdeal)
.then( function (firstImageHash) {

  phash('./images/whey-protein-on-madrugao-croped-gm.jpg')
  .then( function (secondImageHash) {
    console.log('(equal) 1 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
  });

  phash('./images/whey-protein-integralmedica.jpg')
  .then( function (secondImageHash) {
    console.log('(same color) 2 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
  });

  phash('./images/whey-protein-ultimamte-corpoideal.jpg')
  .then( function (secondImageHash) {
    console.log('3 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
  });

  phash('./images/whey-protein-universal-corpoideal.jpg')
  .then( function (secondImageHash) {
    console.log('4 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
  });

  phash('./images/bcaa.jpg')
  .then( function (secondImageHash) {
    console.log('(Bcaa) 5 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
  });

  phash('./images/max-top-whey.jpg')
  .then( function (secondImageHash) {
    console.log('(pote igual mas azul) 6 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
  });

  phash('./images/whey-protein-on-megaforma-croped-gm.jpg')
  .then( function (secondImageHash) {
    console.log('(second equal) 7 hamming distance e', hammingDistance(firstImageHash, secondImageHash));
  });

});
