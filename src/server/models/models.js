const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  favourites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'favouriteList'
  }],
  auditLogs: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'auditLogs'
  }
});

const FavouriteSchema = new mongoose.Schema({
  title: String,
  Description: String,
  metadata: String,
  category: String,
},
{
  timestamps: true
});

const AuditLogs = new mongoose.Schema({
  list: [String]
});

mongoose.model('user', UserSchema);
mongoose.model('favouriteList', FavouriteSchema);
mongoose.model('auditLogs', AuditLogs);
