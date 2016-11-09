module.exports = function (app) {
    var express = require('express');
    var jwt = require('jsonwebtoken');
    var router = express.Router();
    var mailer = require('../helpers/mailer');

    var List = require('../models/lists');
    var User = require('../models/users')

    app.use('/api/lists', router);

    router.post('/', function (req, res) {
        var listData = JSON.parse(req.body.list);
        var listOwnerData = JSON.parse(req.body.owner);
        var list = new List({
            name: listData.name,
            picturePath: listData.picturePath,
            subscribers: listData.invitations,
            owner: {
                id: listOwnerData.id,
                username: listOwnerData.username,
                email: listOwnerData.email
            }
        });

        list.save(function (err, results) {
            if (err) return console.error(err);

            listData.invitations.forEach(function (user) {
                var data = {
                    listname: listData.name,
                    invitationlink: req.headers.host + "/#/login/" + results._id
                };
                mailer.sendEmail('invite-user-to-list', data, "Invitation to join " + listData.name + " list on Dailymumm", user.email, function () {
                    console.log('invitation sent to ' + user.email);
                });
            });

            res.json(results);
        });
    });

    router.get('/byuser', function (req, res) {
        var userId = req.param("userId");

        List.find({ "owner.id": userId }, function (err, data) {
            if (err) return console.error(err);

            if (data) {
                List.find({ "subscribers": { $elemMatch: { id: userId } } }, function (err2, data2) {
                    if (err2) return console.error(err2);

                    if (data2) {
                        data = data.concat(data2);
                        res.json(data)
                    } else {
                        res.json(null);
                    }
                });
            } else {
                res.json(null);
            }
        });
    });

    router.put('/', function (req, res) {
        var listData = JSON.parse(req.body.list);

        listData.invitations.forEach(function (user) {
            var data = {
                listname: listData.name,
                invitationlink: req.headers.host + "/#/login/" + listData.id
            };
            mailer.sendEmail('invite-user-to-list', data, "Invitation to join " + listData.name + " list on Dailymumm", user.email, function () {
                console.log('invitation sent to ' + user.email);
            });
        });
        List.update({ "_id": listData.id }, {
            name: listData.name,
            picturePath: listData.picturePath,
            $push: {
                subscribers: {
                    $each: listData.invitations
                }
            }
        }, function (err, data) {
            if (err) return console.error(err);

            if (data) {
                res.json(data)
            } else {
                res.json(null);
            }
        });
    });

    router.put('/invite', function (req, res) {
        var listId = req.body.listId;
        var listOfSubscribers = JSON.parse(req.body.listOfSubscribers);

        List.update({ "_id": listId }, {
            $push: {
                subscribers: {
                    $each: listOfSubscribers
                }
            }
        }, function (err, data) {
            if (err) return console.error(err);

            if (data) {
                res.json(data)
            } else {
                res.json(null);
            }
        });
    });

    router.put('/addinviteduserdata', function (req, res) {
        var listId = req.body.id;
        var user = JSON.parse(req.body.user);

        var userToSave = {};

        User.findOne({ email: user.email }, function (err, data) {
            if (err) return console.error(err);

            userToSave = {
                username: data.username,
                email: data.email,
                fullname: data.fullname || '',
                confirmed: false
            };
        })

        List.findOne({ "_id": listId }, function (err, data) {
            if (err) return console.error(err);

            for (var i = 0; i < data.subscribers.length; i++) {
                if (data.subscribers[i].email === userToSave.email) {

                    List.update({ "_id": listId }, {
                        $set: {
                            'subscribers.1': userToSave
                        }
                    }, function (err, data) {
                        if (err) return console.error(err);

                        if (data) {
                            res.json(data)
                        } else {
                            res.json(null);
                        }
                    });
                    
                    break;
                }
            }
        });
    });

    router.delete('/', function (req, res) {

    });

};