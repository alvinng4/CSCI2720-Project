/**
 * This file's purpose is to quickly initialize your local
 * MongoDB database, for testing / development purpose.
 */

import fs from "fs";
import mongoose from "mongoose";

import EventModel from "./src/models/Event.js";
import LocationModel from "./src/models/Location.js";
import UserModel from "./src/models/User.js";

const DEFAULT_PORT = "27017";
const DEFAULT_DB_NAME = "culturalApp";

const VENUES_PATH = "../data/venues_cleaned.json";
const EVENTS_PATH = "../data/events_cleaned.json";

/* Hard-coded districts for selected venues */
const VENUE_ID_TO_DISTRICT = {
  87616551: "Kowloon City",
  87710033: "Eastern",
  826817417: "Kwun Tong",
  871: "Kwai Tsing",
  87410030: "Wong Tai Sin",
  87510010: "Central and Western",
  87310362: "Yuen Long",
  73810020: "Yau Tsim Mong",
  3110565: "North",
  87810042: "Central and Western",
};

async function main() {
  const args = process.argv.slice(2);
  let port = DEFAULT_PORT;
  let dbName = DEFAULT_DB_NAME;

  console.log("--------------- init_db.js ---------------");

  if (args.length >= 1) {
    if (args[0] == "-h" || args[0] == "--help") {
      console.log("Usage: node init_db.js [dbName] [port]");
      process.exit(0);
    }

    dbName = args[0];
    if (args.length >= 2) {
      port = args[1];
    }
    console.log(`Using dbName: ${dbName}, port: ${port}`);
  } else {
    console.log(`Using default dbName: ${dbName}, port: ${port}`);
  }

  try {
    const link = `mongodb://127.0.0.1:${port}/${dbName}`;
    console.log(`Connecting to ${link}`);
    await mongoose.connect(link);
    console.log("Connection is open...");

    /* Insert admin accounts */
    await insertAdminAccounts();

    /* Insert locations data */
    await insertLocationData(VENUES_PATH, VENUE_ID_TO_DISTRICT);

    /* Insert Event data */
    await insertEventData(EVENTS_PATH);

    /* Close connection */
    console.log("\nInitialization completed. Closing connection...");
    await mongoose.connection.close();
  } catch (err) {
    console.error(`\nError occurred: ${err}`);

    /* Close connection */
    console.log("Abort. Closing connection...");
    await mongoose.connection.close();
    console.log("----------------------------------------");
    process.exit(1);
  }
  console.log("------------------------------------------");
}

async function insertAdminAccounts() {
  console.log("\nInserting admin accounts onto database");
  // await UserModel.insert({
  //   email: "admin@example.com",
  //   password:
  // });
  console.log("Skipped: not implemented yet.");
  // console.log(`Inserted 1 admin account.`);
}

async function insertLocationData(venuesPath, venueIdToDistrict) {
  /* Load locations data */
  console.log(`\nLoading location data from ${venuesPath}`);
  const rawLocationData = JSON.parse(fs.readFileSync(venuesPath, "utf8"));
  const locationData = rawLocationData.map((venue) => {
    return {
      sourceId: Number(venue.id),
      nameC: venue.venuec.trim(),
      nameE: venue.venuee.trim(),
      latitude: Number(venue.latitude),
      longitude: Number(venue.longitude),
      district: venueIdToDistrict[venue.id],
    };
  });

  /* Insert locations onto database */
  console.log("Inserting location data onto database");
  await LocationModel.insertMany(locationData);
  console.log(`Inserted ${locationData.length} locations.`);
}

async function insertEventData(eventsFile) {
  /* Load events data */
  console.log(`\nLoading event data from ${eventsFile}`);
  const rawEventData = JSON.parse(fs.readFileSync(eventsFile, "utf8"));

  // Get location reference
  console.log("Looking up locations from database to get their object id");
  const dbLocations = await LocationModel.find();
  const locationIdMap = new Map();
  dbLocations.forEach((loc) => {
    locationIdMap.set(loc.sourceId, loc._id);
  });

  const eventData = rawEventData.map((event) => {
    const locationObjectId = locationIdMap.get(Number(event.venueid));
    if (!locationObjectId) {
      throw new Error(
        `Location id not found for event id ${event.id}, venueid ${event.venueid}`
      );
    }

    return {
      sourceId: Number(event.id),
      titleC: event.titlec.trim(),
      titleE: event.titlee.trim(),
      location: locationObjectId,
      preDateC: event.predateC?.trim(),
      preDateE: event.predateE?.trim(),
      progTimeC: event.progtimec?.trim(),
      progTimeE: event.progtimee?.trim(),
      ageLimitC: event.agelimitc?.trim(),
      ageLimitE: event.agelimite?.trim(),
      priceC: event.pricec?.trim(),
      priceE: event.pricee?.trim(),
      descC: event.descc?.trim(),
      descE: event.desce?.trim(),
      urlC: event.urlC?.trim(),
      urlE: event.urlE?.trim(),
      tAgentUrlC: event.tagenturlc?.trim(),
      tAgentUrlE: event.tagenturle?.trim(),
      remarkC: event.remarkc?.trim(),
      remarkE: event.remarke?.trim(),
      enquiry: event.enquiry?.trim(),
      email: event.email?.trim(),
      presenterOrgC: event.presenterorgc?.trim(),
      presenterOrgE: event.presenterorge?.trim(),
    };
  });

  /* Insert Events onto database */
  console.log("Inserting event data onto database");
  await EventModel.insertMany(eventData);
  console.log(`Inserted ${eventData.length} events.`);
}

main();
