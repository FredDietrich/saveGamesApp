if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

/* declaring dependencies variables */
const express = require('express');
const app = express();
const path = require('path');
const MongoClient = require('mongodb');
const bcrypt = require('bcrypt');
const fileUpload = require('express-fileupload');
const initializePassport = require('./passport-config');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const scrapeThis = require('./scraper');
const axios = require('axios');
const mongo = require('./mongo')
const listOfGames = require('./games');


//express configuration
app.use(express.json());
app.use(express.urlencoded({ extended: false}))
app.use(fileUpload());
app.set('view-engine', 'ejs');
app.use(flash())
app.use(session(
    {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    }
))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

//global functions
function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

initializePassport(passport);
//express routing
app.get('/', (req, res) => {
    if(typeof req.query.page !== 'undefined' && typeof req.query.limit !== 'undefined') {
        mongo.getSaves([req.query.limit, req.query.page], req, res);
    } else {
        if(typeof req.query.limit === 'undefined' && typeof req.query.page !== 'undefined') {
            mongo.getSaves([15, req.query.page], req, res);
        }
        if(typeof req.query.limit === 'undefined' && typeof req.query.page === 'undefined'){
            mongo.getSaves([15,1], req, res);
        }
        if(typeof req.query.limit !== 'undefined' && typeof req.query.page === 'undefined') {
            mongo.getSaves([req.query.limit, 1], req, res);
        }
    }
});
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));
app.get('/register', checkNotAuthenticated,  (req, res) => {
    if(req.query.error === 'userexists') {
        res.render('register.ejs', {message:'Usuario com esse email ja existe.'});
    } else {
        res.render('register.ejs');
    }
});
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const attr = {
            id: Date.now().toString(),
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword
        };
        mongo.userExists(attr.username, (go) => {
            if(go) {
                res.redirect('/register?error=userexists');
            } else {
                mongo.sendUser(attr);
                res.redirect('/login');
            }
        });
    } catch (e) {
        console.log('erro encontrado' + e);
        res.redirect('/register');
    }
});
app.get('/postar', checkAuthenticated, (req, res) => {
    if(req.query.error === 'gamenotfound') {
        if(typeof req.user !== 'undefined') {
            res.render('postar.ejs', {usersname : req.user.name, message: 'Thumbnail do jogo nao encontrada, confira o nome do jogo inserido e tente novamente.'});
        }
        else {
            res.render('postar.ejs', {usersname : null, message: 'Thumbnail do jogo nao encontrada, confira o nome do jogo inserido e tente novamente.'});
        }   
    } else {
        if(typeof req.user !== 'undefined') {
            res.render('postar.ejs', {usersname : req.user.name});
        }
        else {
            res.render('postar.ejs', {usersname : null});
        }   
    }
})
app.post('/posts', async (req, res) => {
    try {
            scrapeThis('https://www.pcgamingwiki.com/w/index.php?search=' + req.body.game, src => {
                if(src !== null) {
                    const dataT = {
                        userID: req.user.id,
                        username: req.user.username,
                        title: req.body.title,
                        desc: req.body.desc,
                        url: req.body.url,
                        game: req.body.game,
                        imgSrc: src
                    }
                    mongo.sendSave(dataT);
                    res.redirect('/')
                } else {
                    res.redirect('/postar?error=gamenotfound')
                }
            });
    } catch (e) {
        console.log(e);
        res.redirect('/postar')
    }
})
app.get('/user/:uname', (req, res) => {
    mongo.getUserSaves(req.params.uname, ans => {
        if(req.isAuthenticated()) {
        if(ans.length > 0) {
            res.render('user.ejs', {data: ans, user:req.user})
        } else {
            res.render('user.ejs', {data: null, user:req.user})
        }
    } else {
        if(ans.length > 0) {
            res.render('user.ejs', {data: ans, user:null})
        } else {
            res.render('user.ejs', {data: null, user:null})
        }
    }
    });
});

//start listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Port: ${ PORT }`);
});
