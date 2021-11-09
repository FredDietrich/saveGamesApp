const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const MongoClient = require('mongodb');
if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
var url = process.env.MONGO_URL;
//const mongoClient = new MongoClient.MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
function initialize(passport) {
    const authenticateUser = async (username, password, done) => {
        var user;
        MongoClient.MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("savesDB");
            var query = { username: username};
            cursor = dbo.collection("users").find(query);
            await cursor.forEach(dodo => {rr = dodo;});
            if(typeof rr !== 'undefined') {
                later(rr)
            }
            else {
                later(null);
            }
        });
        async function later(user) {
        if(user == null) {
            return done(null, false, {message: 'Verifique a senha ou username'})
        }
        try {
            if(await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, {message: 'Verifique a senha ou username'})
            }
        } catch (e) {
            return done(e)
        }
    }
    }
    passport.use(new localStrategy(authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        MongoClient.MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var rt;
            var dbo = db.db("savesDB");
            var query = { id:id};
            cursor = dbo.collection("users").find(query);
            await cursor.forEach(dodo => {rt = dodo;});
            done(null, rt)
        });
     })
}


module.exports = initialize