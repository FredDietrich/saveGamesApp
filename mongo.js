const MongoClient = require('mongodb');
var url = "mongodb+srv://dietrich-admin:JGNhFdgEnJdJA6fm@savescluster.p8ha1.mongodb.net/savesCluster?retryWrites=true&w=majority";


exports.sendUser = (obj) => {
    MongoClient.MongoClient.connect(url, (err, db) => {
        if(err) throw err;
        let savesDB = db.db("savesDB");
        savesDB.collection("users").insertOne(obj, (err, res) => {
            if(err) throw err;
            db.close();
        });
    });
}
exports.sendSave = (obj) => {
    MongoClient.MongoClient.connect(url, (err, db) => {
        if(err) throw err;
        let savesDB = db.db("savesDB");
        savesDB.collection("saves").insertOne(obj, (err, res) => {
            if(err) throw err;
            console.log("save inserted");
            db.close();
        });
    });
}
exports.userExists = (username, fn) => {
    MongoClient.MongoClient.connect(url, async (err, db) => {
        if(err) throw err;
        let savesDB = db.db("savesDB")
        let query = {username: username};
        let cursor = savesDB.collection("users").find(query);
        await cursor.forEach(dodo => {rt = dodo;});
        if(typeof rt !== 'undefined') {
            fn(true);
        } else {
            fn(false);
        }
    });
}
exports.getUserSaves = (uname, fn) => {
    MongoClient.MongoClient.connect(url, async (err, db) => {
        if(err) throw err;
        let savesDB = db.db("savesDB")
        let query = {username: uname};
        savesDB.collection("saves").find(query).toArray((err, result) => {
            if(err) throw err;
            fn(result);
        })
    });
}
exports.savesLength = fn => {
    MongoClient.MongoClient.connect(url, (err, db) => {
        if(err) throw err;
        let savesDB = db.db("savesDB");
        savesDB.collection("saves").find({}).toArray((err, result) => {
            if(err) throw err;
            db.close();
            fn(result.length)
        });
    });
}
exports.getSaves = (range, req, res) => {
    //[limit, page]
    var skippers;
    MongoClient.MongoClient.connect(url, (err, db) => {
        if(err) throw err;
        var dbo = db.db("savesDB");
        if(parseInt(range[1]) < 2) {
            skip = 0;
        } else {
            skip = (parseInt(range[1]) - 1) * parseInt(range[0]);
        }
        if(isNaN(skip) || isNaN(parseInt(range[0]))) {
            res.redirect('/')
        } else {
            dbo.collection("saves").find({}).skip(skip).limit(parseInt(range[0])).toArray((err, result) => {
                if(err) throw err
                db.close();
                if(typeof req.user !== 'undefined') {
                    exports.getUserSaves(req.user.id, ans => {
                        if(ans.length > 0) {
                            exports.savesLength(length => {
                                var lengthArr = [];
                                for(i=1;i < length + 1; i++) {
                                    lengthArr.push(i);
                                }
                                res.render('index.ejs', {user: req.user, data : result, hasSaves: true, length:lengthArr});
                            })
                        } else {
                            exports.savesLength(length => {
                                var lengthArr = [];
                                for(i=1;i < length + 1; i++) {
                                    lengthArr.push(i);
                                }
                                res.render('index.ejs', {user: req.user, data : result, hasSaves: false, length:lengthArr});
                            })
                        }
                    })
                }
                else {
                    exports.savesLength(length => {
                        var lengthArr = [];
                        for(i=1;i < length + 1; i++) {
                            lengthArr.push(i);
                        }
                        res.render('index.ejs', {user : {name:null}, data : result, hasSaves: false, length:lengthArr});
                    })
                }  
            });
        }
    });
}