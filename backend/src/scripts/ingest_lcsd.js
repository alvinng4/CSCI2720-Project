require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Event = require("../models/Event");         // adjust if your path differs
const Location = require("../models/Location");   // add this model if not present
const { parseShowtimes } = require("../utils/eventsImport");

async function main() {
  await connectDB();

  // load your LCSD JSON file
  const file = process.argv[2] || path.join(__dirname, "lcsd_sample.json");
  const rows = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const item of rows) {
    // map LCSD venueid -> your Location (suggest store lcsdVenueId on Location)
    const loc = await Location.findOne({ lcsdVenueId: item.venueid });
    if (!loc) {
      console.warn("Skip event; no location for venueid", item.venueid);
      continue;
    }

    const shows = parseShowtimes(item.predateE || item.predateC);
    for (const { date, time } of shows) {
      await Event.create({
        title: item.titlee || item.titlec,
        description: item.desce || item.descc,
        price: item.pricee || item.pricec,
        presenter: item.presenterorge || item.presenterorgc,
        date,
        time,
        venueId: loc._id,
        venue: loc.nameE || loc.name,
      });
    }
  }

  console.log("Ingest done.");
  await mongoose.connection.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
