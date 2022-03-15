# doodleio

## Steps Required Before Executing
1. Add password to env.json
2. Set up local database

### Adding PostgreSQL Password
In the env.json file, edit the password attribute ("password": "") and type in your own password in the quotation marks to allow access to your local PostgreSQL login.
### Setting Up the Database
```psql --username postgres```

```CREATE DATABASE doodleio;```

```\c doodlio```

```\i [path to sql file]```

NOTE: do not include the "C:" part of the path and make sure that the slashes between directories are "/"