'use latest';
import bodyParser from 'body-parser';
import express from 'express';
import Webtask from 'webtask-tools';
import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';
import ejs from 'ejs';
const collection = 'users';
const server = express();


server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.get('/', (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
    });
    res.end(ejs.render(hereDoc(changePasswordRequestForm), {
        title: 'Change Password Request',
        action: 'https://vjayaram-playground.au8.webtask.io/change-password-poc/'
    }));
})
server.get('/:_id', (req, res, next) => {
    const { MONGO_URL } = req.webtaskContext.secrets;
    MongoClient.connect(MONGO_URL, (err, db) => {
        const { _id } = req.params;
        if (err) return next(err);
        db.collection(collection).findOne({ _id: new ObjectID(_id) }, (err, result) => {
            db.close();
            if (err) return next(err);
            res.status(200).send(result);
        });
    });
});
server.post('/', (req, res, next) => {
    const { MONGO_URL } = req.webtaskContext.secrets;
    // Do data sanitation here.
    console.log(req.body);
    const model = req.body;
    MongoClient.connect(MONGO_URL, (err, client) => {
        const db = client.db('skymomentum');
        if (err) return next(err);
        db.collection(collection).findOne(model, (err, result) => {
            client.close();
            if (err) return next(err);

            workflow(result, req, function (e, cb) {
                if (e) {
                    return res.status(500).send(e);
                } else {
                    res.status(200).send({ message: "We've sent you an email with instructions to reset your password, Please check your inbox." });
                }
            })
        });
    });
});

function hereDoc(f) {
    return f.toString().
        replace(/^[^\/]+\/\*!?/, '').
        replace(/\*\/[^\/]+$/, '');
}

function changePasswordRequestForm() {
    /*
    <!DOCTYPE html>
    <html lang="en">
      <head>
      <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title><%-title %></title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
        <link href="//cdn.auth0.com/styleguide/latest/lib/logos/img/favicon.png" rel="shortcut icon">
        <style>
          body { padding-top: 20px; padding-bottom: 20px; }
          .jumbotron { text-align: center; border-bottom: 1px solid #e5e5e5; }
          .jumbotron .btn { padding: 14px 24px; font-size: 21px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="jumbotron">
            <h1><%-title %></h1>
            <p>To continue, please provide your username in this form.</p>
            <form action="<%-action %>" method="post">
              <input type="text" name="username" placeholder="USERNAME" class="form-control">
              <br/> 
              <input type="submit" class="btn btn-lg btn-success" value="Submit">
            </form>
          </div>
        </div>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
      </body
    </html>
    */
}
function workflow(user, req, cb) {
    // Perform any asynchronous actions, e.g. send notification to Slack.
    var nodemailer = require('nodemailer');
    var smtpTransport = require('nodemailer-smtp-transport');
    var tools = require('auth0-extension-tools@1.3.1');
    var async = require('async');
    var Liquid = require("liquid-node");
    var engine = new Liquid.Engine();

    /*
    * Constants
    */
    var EMAIL_FROM = "noreply@skymom";
    var EMAIL_SUBJECT = "Set your Password";

    /*
    * SMTP Transport object
    */
    var smtpConfig = {
        host: req.webtaskContext.secrets.SMTP_HOST,
        port: req.webtaskContext.secrets.SMTP_PORT,
        secure: false, // upgrade later with STARTTLS
        auth: {
            user: req.webtaskContext.secrets.SMTP_USERNAME,
            pass: req.webtaskContext.secrets.SMTP_PASSWORD
        }
    };
    var transporter = nodemailer.createTransport(smtpTransport(smtpConfig));
    var connection_id = req.webtaskContext.secrets.CONNECTION_ID;
    var email = user.username + '@invalid.skymomentum.com';
    /*
    * 1. Get Auth0 Management Token
    * 2. create password reset  ticket
    * 3. get reset email template
    * 4. populate template with data 
    * 5. send email 
    */

    function callAuth0ManagementApi(stage, options, callback) {
        tools.managementApi.getClient({ domain: req.webtaskContext.secrets.AUTH0_DOMAIN, clientId: req.webtaskContext.secrets.AUTH0_CLIENT_ID, clientSecret: req.webtaskContext.secrets.AUTH0_CLIENT_SECRET })
            .then(function (client) {
                switch (stage) {
                    case 'create_change_password_ticket':
                        var data = {};
                        data.connection_id = connection_id;
                        data.email = email;
                        //data.mark_email_as_verified = true;
                        if (options.template.resultUrl) {
                            data.result_url = options.template.resultUrl;
                        }
                        console.log(data);
                        client.tickets.changePassword(data, function (error, ticket) {
                            if (error) return callback(error);
                            options.ticket = ticket;
                            return callback(null, options)
                        });
                        break;
                    case 'get_change_password_email_template':
                        client.emailTemplates.get({ name: "reset_email" }, function (error, template) {
                            if (error) return callback(error);
                            options.template = template;
                            return callback(null, options)
                        });
                        break;
                }
            })
            .catch(error => console.log(error));
    }


    function getChangePasswordEmailTemplate(options, callback) {
        console.log("1. getChangePasswordEmailTemplate>>>");
        callAuth0ManagementApi('get_change_password_email_template', options, callback);
    }

    function createChangePasswordTicket(options, callback) {
        /*
         * https://auth0.com/docs/api/management/v2#!/Tickets/post_password_change
         * var data = {
         *   user_id: '{USER_ID}',
         *   result_url: '{REDIRECT_URL}' // Optional redirect after the ticket is used.
         *   "mark_email_as_verified": false // Whether to set the email_verified attribute to true (true) or whether it should not be updated (false).
         * };
        */
        console.log("2. createChangePasswordTicket>>>");
        callAuth0ManagementApi('create_change_password_ticket', options, callback);

    }

    function populateEmailTemplate(options, callback) {
        engine
            .parseAndRender(options.template.body, { url: options.ticket.ticket, user: user })
            .then(function (renderedTemplate) {
                console.log(renderedTemplate);
                options.renderedTemplate = renderedTemplate;
                callback(null, options)
            })
            .catch(error => callback(error));
    }

    function sendChangePasswordEmail(options, callback) {
        var mailOptions = {
            from: EMAIL_FROM,
            to: user.email,
            subject: EMAIL_SUBJECT,
            html: options.renderedTemplate
        };
        transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                callback(error);
            } else {
                console.log("Message sent: " + response.message);
                callback(null, 'done');
            }
            // if you don't want to use this transport object anymore, uncomment following line
            //smtpTransport.close(); // shut down the connection pool, no more messages
        });
    }

    async.waterfall([
        async.apply(getChangePasswordEmailTemplate, {}),
        createChangePasswordTicket,
        populateEmailTemplate,
        sendChangePasswordEmail
    ], function (err, result) {
        console.log('err', err);
        console.log('result: ', result);
        cb();
    });
};
module.exports = Webtask.fromExpress(server);
