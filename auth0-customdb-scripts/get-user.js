function getUser(email, callback) {
    const MongoClient = require('mongodb@3.1.4').MongoClient;
    const client = new MongoClient(configuration.MONGO_URL);
    let username = email.split('@')[0];
    client.connect(function (err) {
        if (err) return callback(err);

        const db = client.db('<DB>');
        const users = db.collection('<COLLECTION>');

        users.findOne({ username: username }, function (err, user) {
            client.close();

            if (err) return callback(err);
            if (!user) return callback(null, null);
            return callback(null, {
                user_id: user._id.toString(),
                username: user.username,
                email: email
            });
        });
    });
}
