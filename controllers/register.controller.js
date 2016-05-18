var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var path = require('path')
var multer = require('multer')

var storage = multer.diskStorage({
  destination: './public/images/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err);

      cb(null, raw.toString('hex') + path.extname(file.originalname));
    })
  }
})

var upload = multer({ storage: storage })

router.get('/', function (req, res) {
    res.render('register');
});
 
router.post('/signup', upload.single('avatar'), function (req, res) {

	req.body.avatar = req.file.filename;

    request.post({
        url: config.apiUrl + '/users/register',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.render('register', { error: 'An error occurred' });
        }
 
        if (response.statusCode !== 200) {
            return res.render('register', {
                error: response.body,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
            });
        }
 
        // return to login page with success message
        req.session.success = 'Registration successful';
        return res.redirect('/login');
    });
});
 
module.exports = router;