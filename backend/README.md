## Initializing MongoDB database
First, install the required packages
```
npm install
```
We assume the preprocessed data is available at `../data/` folder. Required data:
* `../data/venues_cleaned.json`
* `../data/events_cleaned.json`

We aim to initialize the following data:
* Events
* Locations
* Districts
* Admin account
* Comments

Run the following command to initialize the database.
```
node init_db.js [dbName] [port]
```

> [!Warning]\
> The program will not overwrite your database. Instead, it will insert new data.
> If you want to have a fresh start, be sure to delete your database first.