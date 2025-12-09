/**
 * This file's purpose is to quickly initialize your local
 * MongoDB database, for testing / development purpose.
 */

const fs = require('fs');
const mongoose = require('mongoose');

const venues_file = "venues_cleaned.json"
const events_file = "events_cleaned.json"
const venueIdToDistrict = {
    "87616551": "Kowloon City",
    "87710033": "Eastern",
    "826817417": "Kwun Tong",
    "871": "Kwai Tsing",
    "87410030": "Wong Tai Sin",
    "87510010": "Central and Western",
    "87310362": "Yuen Long",
    "73810020": "Yau Tsim Mong",
    "3110565": "North",
    "87810042": "Central and Western",
};

async function main() {
    const args = process.argv.slice(2);
    let port = '27017';
    let dbName = 'projectDatabase';

    if (args.length >= 1) {
        if (args[0] == '-h' || args[0] == '--help') {
            console.log('Usage: node init_db.js [dbName] [port]')
            process.exit(0);
        }

        dbName = args[0];
        if (args.length >= 2) {
            port = args[1];
        }
        console.log(`Using dbName: ${dbName}, port: ${port}`);
    }
    else {
        console.log(`Using default dbName: ${dbName}, port: ${port}`);
    }

    try{
        const link = `mongodb://127.0.0.1:${port}/${dbName}`;
        console.log(`Connecting to ${link}`);
        await mongoose.connect(link);
        console.log('Connection is open...');

        /* Define Location Schema and Model */
        const LocationSchema = mongoose.Schema({
            id: { type: Number, required: true, unique: true },
            nameC: { type: String, required: true },
            nameE: { type: String, required: true },
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
            district: { type: String, required: true },
        }, { versionKey: false });
        const LocationModel = mongoose.model('Location', LocationSchema);

        /* Load locations data */
        console.log(`\nLoading location data from ${venues_file}`);
        const rawLocationData = JSON.parse(
            fs.readFileSync(venues_file, 'utf8')
        );
        const locationData = rawLocationData.map((venue) => {
            return {
                id: Number(venue.id),
                nameC: venue.venuec,
                nameE: venue.venuee,
                latitude: Number(venue.latitude),
                longitude: Number(venue.longitude),
                district: venueIdToDistrict[venue.id],
            }
        });

        /* Insert locations onto database */
        console.log('Inserting location data onto database');
        await LocationModel.insertMany(locationData);
        console.log(`Inserted ${locationData.length} locations.`);

        /* Define Event Schema and Model */
        const EventSchema = mongoose.Schema({
            id: { type: Number, required: true, unique: true },

            titlec: { type: String, required: true },
            titlee: { type: String, required: true },

            predateC: { type: String },
            predateE: { type: String },

            progtimec: { type: String },
            progtimee: { type: String },

            location: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Location',
                required: true,
            },

            agelimitc: { type: String },
            agelimite: { type: String },

            pricec: { type: String },
            pricee: { type: String },

            descc: { type: String },
            desce: { type: String },

            urlc: { type: String },
            urle: { type: String },

            tagenturlc: { type: String },
            tagenturle: { type: String },

            remarkc: { type: String },
            remarke: { type: String },

            enquiry: { type: String },
            email: { type: String },

            presenterorgc: { type: String },
            presenterorge: { type: String  },

            submitdate: { type: Date },
        }, { versionKey: false });
        const EventModel = mongoose.model('Event', EventSchema);

        /* Load events data */
        console.log(`\nLoading event data from ${events_file}`);
        const rawEventData = JSON.parse(
            fs.readFileSync(events_file, 'utf8')
        );

        // Get location reference
        console.log('Looking up locations from database to get their object id');
        const dbLocations = await LocationModel.find();
        const locationIdMap = new Map();
        dbLocations.forEach(loc => {
            locationIdMap.set(loc.id, loc._id);
        });

        const eventData = rawEventData.map((event) => {
            const locationObjectId = locationIdMap.get(Number(event.venueid));
            if (!locationObjectId) {
                throw new Error(`Location id not found for event id ${event.id}, venueid ${event.venueid}`);
            }

            const newEvent = { ...event };
            newEvent['id'] = Number(event.id);
            newEvent['location'] = locationObjectId;

            return newEvent;
        });

        /* Insert Events onto database */
        console.log('Inserting event data onto database');
        await EventModel.insertMany(eventData);
        console.log(`Inserted ${eventData.length} events.`);

        /* Close connection */
        console.log('\nInitialization completed. Closing connection...');
        await mongoose.connection.close();
    } catch (err) {
        console.error(`\nError occurred: ${err}`)

        /* Close connection */
        console.log('Abort. Closing connection...');
        await mongoose.connection.close();

        process.exit(1);
    }
}

main();