const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db/connect');
const {
    validateUser,
    isInvalidField,
    generateAuthToken
} = require('../utils/common');
const authMiddleware = require('../middleware/auth');

const Router = express.Router();

Router.post('/signup', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        const validFieldsToUpdate = [
            'first_name',
            'last_name',
            'email',
            'password'
        ];
        const receivedFields = Object.keys(req.body);
        const isInvalidFieldProvided = isInvalidField(
            receivedFields,
            validFieldsToUpdate
        );

        if (isInvalidFieldProvided) {
            return res.status(400).send({
                signup_error: 'Invalid field.'
            });
        }

        const result = await pool.query(
            'select count(*) as count from publisher where email=$1',
            [email]
        );

        const count = result.rows[0].count;
        if (count > 0) {
            return res.status(400).send({
                signup_error: 'User with this email address already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        await pool.query(
            'insert into publisher(first_name, last_name, email, password) values($1,$2,$3,$4)',
            [first_name, last_name, email, hashedPassword]
        );
        res.status(201).send();
    } catch (error) {
        res.status(400).send({
            signup_error: 'Error while signing up..Try again later.'
        });
    }
});

Router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await validateUser(email, password);
        if (!user) {
            res.status(400).send({
                sigin_error: 'Email/password does not match.'
            });
        }
        const token = await generateAuthToken(user);

        const result = await pool.query(
            'insert into tokens(access_token, publisher_id) values($1,$2) returning *',
            [token, user.publisher_id]
        );
        if (!result.rows[0]) {
            return res.status(400).send({
                signin_error: 'Error while signing in..Try again later.'
            });
        }
        user.token = result.rows[0].access_token;
        res.send(user);
    } catch (error) {
        res.status(400).send({
            signin_error: 'Email/password does not match.'
        });
    }
});

Router.post('/logout', authMiddleware, async (req, res) => {
    try {
        const { publisher_id, access_token } = req.user;
        await pool.query('delete from tokens where publisher_id=$1 and access_token=$2', [
            publisher_id,
            access_token
        ]);
        res.send();
    } catch (error) {
        res.status(400).send({
            logout_error: 'Error while logging out..Try again later.'
        });
    }
});

Router.post('/create_survey', async (req, res) => {
    try {
        const { survey_title, question, answer, email } = req.body;

        const result_publisher = await pool.query(
            'SELECT publisher_id FROM publisher WHERE email=$1',
            [email]
        );
        const publisher_id = result_publisher.rows[0].publisher_id; 

        const result_publisher_survey = await pool.query(
            'SELECT count(*) as count FROM survey WHERE survey_title=$1 AND publisher_id=$2', [survey_title, publisher_id]
        );
        const count = result_publisher_survey.rows[0].count;

        if (count < 1) {
            await pool.query(
                'INSERT INTO survey(publisher_id, survey_title) VALUES ($1, $2)', 
                [publisher_id, survey_title]
            )
        };

        const result_survey = await pool.query(
            'SELECT survey_id FROM survey WHERE survey_title=$1 AND publisher_id=$2',
            [survey_title, publisher_id]
        );
        const survey_id = result_survey.rows[0].survey_id;

        const result_answer_id = await pool.query(
            'INSERT INTO available_answer(answer_text) VALUES ($1) RETURNING available_answer_id',
            [answer]
        );
        const answer_id = result_answer_id.rows[0].available_answer_id;

        const result_question_id  = await pool.query(
            'INSERT INTO question(question_text) VALUES ($1) RETURNING question_id',
            [question]
        );
        const question_id = result_question_id.rows[0].question_id;

        await pool.query(
            'INSERT INTO survey_question(survey_id, question_id) VALUES ($1, $2)',
            [survey_id, question_id]
        );

        await pool.query(
            'INSERT INTO question_available_answer(question_id, available_answer_id) VALUES ($1, $2)',
            [question_id, answer_id]
        );

        res.status(201).send();
    } catch (error) {
        res.status(400).send({
            signup_error: 'Error while adding question to survey..Try again later.'
        });
    }
});

module.exports = Router;