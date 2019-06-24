var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var secret = 'CampK12LiveSecretKey';
const mongoose = require('mongoose');
const UserSchema = mongoose.model('user');

module.exports = passport => {
    
    router.get('/success', (req, res) => {
        console.log('wend user auth success', req.user);
       res.send({state: 'success', user: req.user ? req.user : null, message: req.session.message}); 
    });
   
    router.get('/failure', (req, res) => {
       res.send({state: 'failure', user: null, message: req.session.message}); 
    });
    
    router.get('/logsuccess', (req, res) => {
        res.redirect('/success/' + req.user);
    });

    router.post('/login', passport.authenticate('login', {
        
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));
    
    router.post('/signup', passport.authenticate('signup', {
        
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    router.get('/checkAuth', (req, res) => {
        console.log('check user auth status', req.user);
        if (req.user) {
            console.log('does user exist', req.user);
            res.send({ user: req.user });
        } else {
            res.send({ user: null });
        }
    });
    
    router.get('/logout', (req, res) => {
        
        req.logout();
        res.redirect('/');
    });

    return router;
}