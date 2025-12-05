## Data preprocessing
1. Get government data `venues.xml` and `events.xml` from https://data.gov.hk/en-data/dataset/hk-lcsd-event-event-cultural
2. Install required packages 
```
pip install -r requirements.txt
```
3. Run the program
```
python preprocessing.py
```

## Initializing MongoDB database
Note that Mongoose is required. Navigate to the parent directory and run
```
npm install
```
If you already have Mongoose installed, run the following commands to initialize your database
```
node init_db.js [dbName] [port]
```

> [!Warning]\
> The program will not overwrite your database. Instead, it will insert new data.
> If you want to have a fresh start, be sure to delete your database first.