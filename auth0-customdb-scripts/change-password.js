function changePassword(email, newPassword, callback) {
    const bcrypt = require('bcrypt');
    const MongoClient = require('mongodb@3.1.4').MongoClient;
    const client = new MongoClient(configuration.MONGO_URL);
    let username = email.split('@')[0];
    client.connect(function (err) {
      if (err) return callback(err);
  
      const db = client.db('<DB_NAME>');
      const users = db.collection('<COLLECTION>');
  
      bcrypt.hash(newPassword, 10, function (err, hash) {
        if (err) {
          client.close();
          return callback(err);
        }
  
        users.update({ username: username }, { $set: { password: hash } }, function (err, count) {
          client.close();
          console.log(err, count);
          if (err) return callback(err);
          callback(null, true);
        });
      });
    });
  }
  