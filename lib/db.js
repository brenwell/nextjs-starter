const MongoClient = require('mongodb').MongoClient

function DB(connectionString)
{
    function connect()
    {
        return new Promise((resolve, reject) => {
            MongoClient.connect(connectionString, (err, db) => {
                resolve(db)
            })
        })
    }


    function getUserCollection()
    {
        return new Promise((resolve, reject) => {
            connect().then((db) => {
                userdb = db.collection('users')
                resolve(userdb)
            })
        })

    }

    return {
        getUserCollection
    }
}

module.exports = DB