# Auth0 Custom DB Username Change Password
Sample for custom change password flow for unique usernames and duplicate emails using custom dabase in non import mode

## High Level Workflow

![Image of Change Password Flow](https://github.com/vikasjayaram/auth0-custom-db-username-change-password/blob/master/diagrams/Change%20Password%20flow.jpeg)

## Auth0 Endpoints invoked in the above workflow

- [Get Auth0 Management Token](https://auth0.com/docs/tokens/management-api-access-tokens)
- [Create password reset  ticket](https://auth0.com/docs/api/management/v2/Tickets/post_password_change)
- [Get reset email template](https://auth0.com/docs/api/management/v2/Email_Templates/get_email_templates_by_templateName


## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free account in Auth0

1. Go to [Auth0](https://auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.
