var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const fileUpload = require('express-fileupload');
var formidable = require('formidable');
var fs = require('fs');

var ProofPoint = require('../models/proofpoint');

// Create
router.get('/', function(req, res){
	res.render('create',{
        user: req.user
    });
});

// Submit
router.post('/submitpp', ensureAuthenticated, function(req, res){
    var form = formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.logoImage.path;
        var newpath = './uploads/' + files.logoImage.name;
        fs.rename(oldpath, newpath, function (err) {
          if (err) throw err;
          res.write('File uploaded and moved!');
          res.end();
        });
    
   	var titleText = req.body.titleText;
    var industrySelector = req.body.industrySelector;
    var useCaseSelector = req.body.useCaseSelector;
    var secondaryUseCaseSelector = req.body.secondaryUseCaseSelector;
    var whyMongo1 = req.body.whyMongo1;
    var whyMongo2 = req.body.whyMongo2;
    var whyMongo3 = req.body.whyMongo3;
    var PBO1 = req.body.PBO1;
    var PBO2 = req.body.PBO2;
    var PBO3 = req.body.PBO3;
    var quote = req.body.quote;
    var speakerNotes = req.body.speakerNotes;
    var whyMongo = [whyMongo1, whyMongo2, whyMongo3];
    var pbos = [PBO1, PBO2, PBO3];
    var createdDate = new Date();
    var user = req.user;
    var companyName = req.body.companyName;
    
    console.log("User: " + JSON.stringify(user));
    
    if (req.body.internalOnlyButton === "true")
        var internalOnly = true;
    else 
        var internalOnly = false;
    
    console.log(titleText);
    console.log(industrySelector);
    console.log(useCaseSelector);
    console.log(secondaryUseCaseSelector);
    console.log(whyMongo1);
    console.log(whyMongo2);
    console.log(whyMongo3);
    console.log(PBO1);
    console.log(PBO2);
    console.log(PBO3);
    console.log(quote);
    console.log(speakerNotes);
    console.log(internalOnly); 
    console.log(createdDate);   
    console.log(companyName); 

    // Validation
	req.checkBody('titleText', 'Title is required').notEmpty();
    req.checkBody('industrySelector', 'Please select an industry').notEmpty();
    req.checkBody('useCaseSelector', 'Please select a Primary Use Case').notEmpty();
    req.checkBody('whyMongo1', 'Please enter your first reason of why the customer chose MongoDB').notEmpty();
    req.checkBody('whyMongo2', 'Please enter your second reason of why the customer chose MongoDB').notEmpty();
    req.checkBody('whyMongo3', 'Please enter your third reason of why the customer chose MongoDB').notEmpty();
    req.checkBody('PBO1', 'Please enter your first PBO from choosing MongoDB').notEmpty();
    req.checkBody('PBO2', 'Please enter your second PBO from choosing MongoDB').notEmpty();
    req.checkBody('PBO3', 'Please enter your third PBO from choosing MongoDB').notEmpty();
    req.checkBody('speakerNotes', 'Please enter comprehensive speaker notes').notEmpty();
    req.checkBody('companyName', 'Please enter the Companies Full Name').notEmpty();
   
	var errors = req.validationErrors();

	if(errors){
		res.render('create',{
			errors:errors
		});
	} else {
		var newPP = new ProofPoint({
            title: titleText,
            industry:industrySelector,
            useCaseType: useCaseSelector,
            secondaryUseCaseType: secondaryUseCaseSelector,
            whyMongo:whyMongo,
            pbos:pbos,
            companyName:companyName,
            quote:quote,
            speakerNotes,speakerNotes,
            internalOnly:internalOnly,
            createdDate: createdDate,
            logoImage: newpath,
            user: {
                "name": user.name,
                "email": user.email,
                "username": user.username
            }
	    });
        ProofPoint.createPP(newPP, function(err, newPP){
            	if(err) throw err;
            	console.log(newPP);
            });
		req.flash('success_msg', 'ProofPoint created. Nice.');
		res.redirect('/create');
    }
});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;