# doodleio
## To Run Program (For Mac)
### Clone Repository
1. Open terminal on computer
2. [Terminal] Navigate into the directory where you would like to clone the repository using ```cd```
3. After entering the directory, run the following code in the terminal to clone the repository: ```git clone https://gitlab.cci.drexel.edu/mkq25/doodleio.git```
### Install/Run PostgreSQL
4. [Terminal] Install PostgreSQL if it is not already on your device
5. [Terminal] To run PostgreSQL, run the following command in the terminal: ```psql --username postgres```
6. [Postgres] After entering PostgreSQL, run this command in order to create the database: ```CREATE DATABASE doodleio;```
7. [Postgres] Run this command in order to connect to the database: ```\c doodleio;```
If this is successful, the terminal should return the following messsage: ```You are now connected to database "doodleio" as user "postgres".```
8. [Postgres] To set up the required tables and entries, run the command ```\i /path/to/database/db_setup.sql;```. NOTE: do not include the "C:" part of the path and make sure that the slashes between directories are "/"
9. [Postgres] Type "quit" (without quotations) to exit PostgreSQL. 
### Install Node Modules
10. [Terminal] Navigate into the /app folder using ```cd```
11. [Terminal] Run the command ```npm install``` to install the necessary node modules.
### Modify env.json
12. Open the env.json file using a text editor.
13. Edit the password attribute ("password": "") and type in your own password inside the quotation marks to allow access to your PostgreSQL login.
14. If needed, also change the port attribute ("port": ) to the deault port your PostgreSQL uses.
### Run the Program
15. [Terminal] Make sure you are still located in the /app folder before running the server.
16. [Terminal] Run the following command to start the server: ```node server.js```
17. In any browser, go to localhost:3000 to access the homepage of the website.
18. If you want to open the program on multiple browser windows, you can use incognito mode since cookies keeps users signed in.
### Running on Multiple Devices
For our demonstration, we were able to access and play on our website with multiple devices. 

Note: This is not required to test the program locally -- the same functionality can be seen with multiple tabs (see step 18) on the same device. 

