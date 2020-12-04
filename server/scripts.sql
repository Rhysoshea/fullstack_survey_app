CREATE DATABASE survey_db;

\c survey_db;

CREATE TABLE publisher(
  publisher_id BIGSERIAL PRIMARY KEY NOT NULL,
  first_name VARCHAR(32) NOT NULL,
  last_name VARCHAR(32) NOT NULL,
  email VARCHAR(32) NOT NULL,
  password VARCHAR(255) NOT NULL,
  unique(email)
);

CREATE TABLE TOKENS(
  id BIGSERIAL PRIMARY KEY NOT NULL,
  access_token VARCHAR(500) NOT NULL,
  publisher_id BIGSERIAL NOT NULL,
  FOREIGN KEY(publisher_id) REFERENCES publisher(publisher_id)
);

CREATE TABLE person(
  person_id BIGSERIAL PRIMARY KEY NOT NULL,
  first_name VARCHAR(32) NOT NULL,
  last_name VARCHAR(32) NOT NULL,
  email VARCHAR(32) NOT NULL,
  unique(email)
);

CREATE TABLE available_answer(
  available_answer_id BIGSERIAL PRIMARY KEY NOT NULL,
  answer TEXT NOT NULL
);

CREATE TABLE question(
  question_id BIGSERIAL PRIMARY KEY NOT NULL,
  question_text TEXT NOT NULL,
  available_answer_id BIGSERIAL NOT NULL,
  FOREIGN KEY(available_answer_id) REFERENCES available_answer(available_answer_id)
);

CREATE TABLE survey(
  survey_id BIGSERIAL PRIMARY KEY NOT NULL,
  survey_title TEXT NOT NULL,
  publisher_id BIGSERIAL NOT NULL,
  question_id BIGSERIAL NOT NULL,
  FOREIGN KEY(publisher_id) REFERENCES publisher(publisher_id),
  FOREIGN KEY(question_id) REFERENCES question(question_id)

);

CREATE TABLE answer(
  answer_id BIGSERIAL PRIMARY KEY NOT NULL,
  person_id BIGSERIAL NOT NULL,
  survey_id BIGSERIAL NOT NULL,
  question_id BIGSERIAL NOT NULL,
  available_answer_id BIGSERIAL NOT NULL,
  FOREIGN KEY(person_id) REFERENCES person(person_id),
  FOREIGN KEY(survey_id) REFERENCES survey(survey_id),
  FOREIGN KEY(question_id) REFERENCES question(question_id),
  FOREIGN KEY(available_answer_id) REFERENCES available_answer(available_answer_id)

);




