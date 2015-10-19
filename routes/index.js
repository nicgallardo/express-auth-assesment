var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/authAssesment');
var Users = db.get('users');
var Students = db.get('students');
var bcrypt = require('bcrypt');
var session = require('cookie-session');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user: req.session.user});
});

router.get('/add-student', function(req, res, next) {
  res.render('add-student', { title: 'add-student', user: req.session.user });
});

router.get('/students', function(req, res){
  Students.find({}, function (err, students) {
    res.render('students', {title: 'all students', user: req.session.user, allStudents: students});
  });
});

router.get('/signout', function(req, res){
  req.session = null
  res.redirect('/');
});

router.get('/:id', function(req, res){
  Students.findOne({_id: req.params.id}, function (err, student) {
    res.render('student', {theStudent: student, user: req.session.user});
  });
});

router.post('/signup', function(req, res, next){
  var error = [];
  if(req.body.email.length < 1){
    error.push("email must be valid \n")
  }
  if(req.body.email.indexOf('@') == -1){
    error.push("email must be valid \n")
  }
  if(req.body.password.length < 6){
    error.push("password must be at least 6 characters")
  }
  if(error.length > 0){
    res.render('index', {user: req.session.user, errors: error})
  } else{
    var hash = bcrypt.hashSync(req.body.password, 8)
    Users.insert({
      useremail: req.body.email,
      password: hash,
    }).then(function() {
        res.redirect('/');
    })
  }
});

router.post('/add', function(req, res) {
  var error = [];
  if(req.body.studentName.length < 1){
    error.push("Student Name must be filled out \n")
  }
  if(req.body.studentPhone.length < 10){
    error.push("Student Phone Number must be filled out \n")
  }
  if(error.length > 0){
    res.render('add-student', { title: 'add-student', user: req.session.user, errors: error});
  }else{
    Students.insert({
      studentName: req.body.studentName,
      studentPhone: req.body.studentPhone
    }).then(function() {
      res.redirect('/')
    })
  }
})

router.post('/signin', function(req, res) {
  Users.findOne({email: req.body.useremail}).then(function (user) {
    if(user){
      if(bcrypt.compareSync(req.body.password, user.password)) {
        req.session.user = user.useremail,
        console.log("user = ", user);
        // console.log("req.session", req.session.user);
        res.redirect('/');
      }else {
       res.render("index", {error: "Email / password don't match"})
      }
    }
  })
});

router.post(':id/delete', function(req, res, next) {
  Students.remove({_id: req.params.id}, function (err, student) {
    res.redirect('/');
  })
});

module.exports = router;
