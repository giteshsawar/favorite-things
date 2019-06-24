const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');

const UserSchema = mongoose.model('user');
const FavouriteSchema = mongoose.model('favouriteList');
const AuditLogs = mongoose.model('auditLogs');

function addAuditLog(id, message) {
  return new Promise((resolve) => {
    AuditLogs.update({ _id: id }, { $push: { list: message } }, (err, updated) => {
      if (err) {
        resolve(null);
      } else if (updated) {
        resolve(updated);
      }
    });
  });
}

function saveAudit(audit) {
  return new Promise((resolve) => {
    audit.save((err, saved) => {
      if (err) {
        resolve(null);
      } else {
        resolve(saved);
      }
    });
  });
}

function saveFavourites(favourite) {
  return new Promise((resolve) => {
    favourite.save((err, saved) => {
      if (err) {
        resolve(null);
      } else {
        resolve(saved);
      }
    });
  });
}

router.route('/createNewFavourite')
  .post((req, res) => {
    console.log('generate url', req.body);
    const { post } = req.body;
    const { user } = req;
    const favourite = new FavouriteSchema(post);
    console.log('user in req', user);
    UserSchema.findById(user, async (err, userObj) => {
      if (!err && userObj) {
        const savedFavourite = await saveFavourites(favourite);
        if (savedFavourite) {
          let userAudit;
          const message = `New item ${post.title} added to the favourite list`;
          if (userObj.auditLogs) {
            userAudit = await addAuditLog(userObj.auditLogs, message);
          } else {
            const audit = new AuditLogs({
              list: [message],
            });
            userAudit = await saveAudit(audit);
            userObj.auditLogs = userAudit;
          }
          console.log('add user favourite', userObj, savedFavourite);
          userObj.favourites = userObj.favourites || [];
          userObj.favourites.push(savedFavourite);
          console.log('save user favourite', userObj);
          UserSchema.findByIdAndUpdate(userObj._id, userObj, { findAndModify: false, new: true }).populate(['auditLogs', 'favourites']).exec((error, updated) => {
            if (!error && updated) {
              res.send({ favourite: true, user: updated });
            } else {
              res.send({ favourite: false, error: 'Error adding user\'s new favourite item.' });
            }
          });
        } else {
          res.send({ favourite: false, error: 'Error adding user\'s new favourite item.' });
        }
      }
    });
  });

router.route('/updateFavouritesRank')
  .post(async (req, res) => {
    const { list, changes } = req.body;
    UserSchema.findById(req.user._id, (error, user) => {
      if (!error && user) {
        console.log('update favourite ranking list', req.body, user);
        user.favourites.map(async (item, index) => {
          const newPosition = list.findIndex(l => l._id == item);
          console.log('update list item position', index, newPosition, item);
          if (newPosition >= 0 && index !== newPosition) {
            // const listItem = user.favourites[f];
            user.favourites.splice(newPosition, 0, user.favourites.splice(index, 1)[0]);
          }
        });
        console.log('save user favourites', user.favourites);
        let favouritesUpdated = true;
        UserSchema.findByIdAndUpdate(user._id, user, { new: true }).populate(['auditLogs', 'favourites']).exec((err, updated) => {
          if (!err && updated) {
            res.send({ favourite: true, user: updated });
          } else {
            favouritesUpdated = false;
            res.send({ favourite: false, error: 'Error updating user favourites' });
          }
        });
  
        if (favouritesUpdated) {
          changes.map(async item => {
            let userAudit;
            const message = `${item.title}'s position changed to ${item.newPosition + 1}`;
            if (user.auditLogs) {
              userAudit = await addAuditLog(user.auditLogs, message);
            } else {
              const audit = new AuditLogs({
                list: [message],
              });
              userAudit = await saveAudit(audit);
              user.auditLogs = userAudit;
            }
          });
        }
      } else {
        res.send({ error: 'User not found' });
      }
    });
  });

// router.route('/fetchAllFavourites')
//     .post((req, res) => {
//         const { url } = req.body;
//         fetchAllFavourites(url, res);
//     });

// router.route('/getAllUrls')
//     .get((req, res) => {
//         Url.find({}).populate({ path: 'visitor', populate: { path: 'list' } }).exec((err, urlsList) => {
//             if (err) {
//                 res.send({ list: null, message: 'Not able to fetch links' });
//             } else {
//                 res.send({ list: urlsList });
//             }
//         })
//     });

module.exports = router;
