# profile-management-crud-rest-api
# CRUD REST API for Profile Management
**Github repository link:** [https://github.com/melcholign/profile-management-crud-rest-api]

## Requirements
- npm
- MySQL Database

## Installation and Setup Procedure

- clone the repository on your local machine.
- run the command.
``npm install``
  to install and update all the relevant packages and dependencies required to run the project.
- Execute profile_manager.sql using any MySQL client.
- If access to the database is password-protected, go to line 54 in index.js file and change the password key to your own.
  Otherwise, make it an empty string.

**To run the project, use node index.js**

## Project Structure

The project is made up of three parts:
1. Login  - handles authentication for a valid user with a registered profile
2. Registration  - registers a user
3. Profile  - provides user accesses to their profile

## API documentation

* Registration **(POST /api/register)**: Endpoint to create a new user. Hash passwords before saving.
* Login **(POST /api/login)**: Endpoint to authenticate users. Return a token or session on successful login.
* Get Profile **(GET /api/profile)**: Endpoint to retrieve the logged-in user's profile information.
* Update Profile **(PUT /api/profile)**: Endpoint to update the user's profile information.
* Delete Account **(DELETE /api/profile)**: Endpoint to delete the logged-in user's account.
* Upload Profile Image **(POST /api/profile/image)**: Endpoint to upload and update the user's profile image.

