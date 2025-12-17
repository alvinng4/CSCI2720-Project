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
* Admin account
* Comments

Run the following command to initialize the database.
```
npm run init-db
```

> [!WARNING]\
> The program will drop existing database named "culturalApp"

> [!IMPORTANT]\
> If you re-initialized the database after login, please logout your account on browser to prevent keeping the incorrect token ID.

## Running the backend
If you have completed the steps above, run the following command:
```
npm run dev -- [-s|-slow-internet]
```
`-s|-slow-internet`: Simulate slow internet by adding 1s delay to all backend request