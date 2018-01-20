const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

function Mail(apiKey, domain, fromEmail)
{
    const auth = {
      auth: {
        api_key: apiKey,
        domain,
      },
      // proxy: 'http://user:pass@localhost:8080' // optional proxy, default is false
    }

    const mailer = nodemailer.createTransport(mg(auth));

    /**
     * Sends a verification email.
     *
     * @param  {Object}  arg1          The argument 1
     * @param  {<type>}  arg1.toEmail  To email
     * @param  {string}  arg1.url      The url
     */
    function sendVerificationEmail({toEmail, url})
    {
        const subject = 'Sign in link'
        const text = 'Use the link below to sign in:\n\n' + url + '\n\n'

        if (process.env.NODE_ENV === 'development')  {
            console.log('Generated sign in link ' + url + ' for ' + toEmail)
        }

        return send(toEmail, subject, text)
    }

    /**
     * Sends an email
     *
     * @param  {<type>}   to       { parameter_description }
     * @param  {<type>}   subject  The subject
     * @param  {<type>}   text     The text
     * @return {Promise}  { description_of_the_return_value }
     */
    function send(to,subject,text)
    {
        const data = {from:fromEmail, to, subject, text}

        if (process.env.NODE_ENV === 'development')  {
            console.log(data)
        }

        return new Promise((resolve, reject) =>
        {
            mailer.sendMail(data, (err) => {
                if (err) {
                    console.log('Error sending email to ' + toEmail, err)
                    reject(err)
                }
                resolve()
            })
        })

    }

    return {
        sendVerificationEmail
    }
}

module.exports = Mail