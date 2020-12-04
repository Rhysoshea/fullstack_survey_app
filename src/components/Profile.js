import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Form, Button } from 'react-bootstrap';
import { initiateUpdateProfile } from '../actions/profile';
import { validateFields } from '../utils/common';
import { resetErrors } from '../actions/errors';

class Profile extends React.Component {
    state = {
        survey_title: '',
        question: '',
        question_answer: '',
        email: '',
        errorMsg: '',
        isSubmitted: false
    };

    componentDidMount() {
        const { profile } = this.props;
        if (!_.isEmpty(profile)) {
            const { survey_title, question, question_answer, email } = profile;
            this.setState({
                survey_title,
                question,
                question_answer,
                email
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.errors, this.props.errors)) {
            this.setState({
                errorMsg: this.props.errors
            });
        }
        if (!_.isEqual(prevProps.profile, this.props.profile)) {
            const { survey_title, question, question_answer, email } = this.props.profile;
            this.setState({ survey_title, question, question_answer, email });
        }
    }

    componentWillUnmount() {
        this.props.dispatch(resetErrors());
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const { survey_title, question, question_answer } = this.state;
        const profileData = {
            survey_title,
            question,
            question_answer
        };

        const fieldsToValidate = [{ survey_title }, { question }, { question_answer }];

        const allFieldsEntered = validateFields(fieldsToValidate);
        if (!allFieldsEntered) {
            this.setState({
                errorMsg: {
                    update_error: 'Please enter all the fields.'
                }
            });
        } else {
            this.setState({ isSubmitted: true, errorMsg: '' });
            this.props.dispatch(initiateUpdateProfile(profileData));
        }
    };

    handleOnChange = (event) => {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    };

    render() {
        const { errorMsg, survey_title, question, question_answer, email, isSubmitted } = this.state;
        return (
            <div className="col-md-6 offset-md-3">
                <Form onSubmit={this.handleSubmit} className="profile-form">
                    {errorMsg && errorMsg.update_error ? (
                        <p className="errorMsg centered-message">{errorMsg.update_error}</p>
                    ) : (
                            isSubmitted && (
                                <p className="successMsg centered-message">
                                    Survey updated successfully.
                                </p>
                            )
                        )}
                    <Form.Group controlId="email">
                        <Form.Label>Email address:</Form.Label>
                        <span className="label-value">{email}</span>
                    </Form.Group>
                    <Form.Group controlId="survey_title">
                        <Form.Label>Survey Title:</Form.Label>
                        <Form.Control
                            type="text"
                            name="survey_title"
                            placeholder="Enter title of your survey"
                            value={survey_title}
                            onChange={this.handleOnChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="question">
                        <Form.Label>Question:</Form.Label>
                        <Form.Control
                            type="text"
                            name="question"
                            placeholder="Enter your question"
                            value={question}
                            onChange={this.handleOnChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="question_answer">
                        <Form.Label>Available answer:</Form.Label>
                        <Form.Control
                            type="text"
                            name="question_answer"
                            placeholder="Enter an answer"
                            value={question_answer}
                            onChange={this.handleOnChange}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit
          </Button>
                </Form>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    profile: state.profile,
    errors: state.errors
});

export default connect(mapStateToProps)(Profile);