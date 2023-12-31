DROP SCHEMA IF EXISTS APPLICRUITER;
CREATE SCHEMA APPLICRUITER;
USE APPLICRUITER;
DROP TABLE IF EXISTS JOBS;
CREATE TABLE JOBS (
	JOB_ID INT AUTO_INCREMENT PRIMARY KEY,
    TITLE VARCHAR(255) NOT NULL,
    DESCRIPTION VARCHAR(10000) NOT NULL,
    LEVEL VARCHAR(255) NOT NULL,
    COUNTRY VARCHAR(255) NOT NULL,
    CITY VARCHAR(255) NOT NULL,
    SKILLS VARCHAR(1000)
);
DROP TABLE IF EXISTS RESUMES;
CREATE TABLE RESUMES (
	ID INT AUTO_INCREMENT PRIMARY KEY,
    JOB_ID INT,
    PDF_DATA VARCHAR(1500),
    SIMILARITY_SCORE FLOAT,
    FOREIGN KEY (JOB_ID) REFERENCES Jobs(JOB_ID) ON DELETE CASCADE
);
DROP TABLE IF EXISTS USERS;
CREATE TABLE USERS (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    AUTH_ID VARCHAR(255) UNIQUE,   
    EMAIL VARCHAR(255) NOT NULL UNIQUE,
    EMAIL_VERIFIED VARCHAR(255) NOT NULL,
    LAST_NAME VARCHAR(255),
    FIRST_NAME VARCHAR(255),
    PICTURE VARCHAR(255) NOT NULL,
    REGISTERED TINYINT(1) DEFAULT 0,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP,
    DELETED_AT TIMESTAMP
);
DROP TABLE IF EXISTS JOB_USERS;
CREATE TABLE JOB_USERS (
	JOB_ID INT,
    USER_ID VARCHAR(255),
    FOREIGN KEY (JOB_ID) REFERENCES Jobs(JOB_ID) ON DELETE CASCADE,
    FOREIGN KEY (USER_ID) REFERENCES Users(AUTH_ID) ON DELETE CASCADE
);