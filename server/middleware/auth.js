const jwt = require('jsonwebtoken');
const { pool } = require('../db/connect');

const authMiddleware = async function (req, res, next) {
    try {
        const token = req.header('Authorization').split(' ')[1];
        const decoded = jwt.verify(token, process.env.secret);
        const result = await pool.query(
            'select b.publisher_id,b.first_name,b.last_name,b.email,t.access_token from publisher b inner join tokens t on b.publisher_id=t.publisher_id where t.access_token=$1 and t.publisher_id=$2',
            [token, decoded.userid]
        );
        const user = result.rows[0];
        if (user) {
            req.user = user;
            req.token = token;
            next();
        } else {
            throw new Error('Error while authentication');
        }
    } catch (error) {
        res.status(400).send({
            auth_error: 'Authentication failed.'
        });
    }
};

module.exports = authMiddleware;