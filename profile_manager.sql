DROP DATABASE IF EXISTS profile_manager;
CREATE DATABASE profile_manager;
USE profile_manager;

CREATE TABLE profile (
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(6) NOT NULL CHECK(gender IN ('male', 'female', 'other')),
    date_of_birth DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    password CHAR(60) NOT NULL,
    image_url VARCHAR(2083),

    PRIMARY KEY(email)
)