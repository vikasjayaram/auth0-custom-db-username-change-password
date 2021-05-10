function login(username, password, callback) {
    const bcrypt = require('bcrypt');
    const MongoClient = require('mongodb@3.1.4').MongoClient;
    const client = new MongoClient(configuration.MONGO_URL);
  
    client.connect(function (err) {
      if (err) return callback(err);
  
      const db = client.db('<DB>');
      const users = db.collection('<COLLECTION>');
  
      users.findOne({ username: username }, function (err, user) {
        if (err || !user) {
          client.close();
          return callback(err || new WrongUsernameOrPasswordError(email));
        }
  
        bcrypt.compare(password, user.password, function (err, isValid) {
          client.close();
  
          if (err || !isValid) return callback(err || new WrongUsernameOrPasswordError(username));
  
          return callback(null, {
              user_id: user._id.toString(),
              username: user.username,
              email: user.email
            });
        });
      });
    });
  }
  