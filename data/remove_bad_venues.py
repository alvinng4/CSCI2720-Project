"""Remove those venues without latitude and longitude.
Also remove the events that has those venues.
"""

import json


def clean_venues_and_events():
    with open("venues.json", "r", encoding="utf-8") as f:
        venues_data = json.load(f)

    with open("events.json", "r", encoding="utf-8") as f:
        events_data = json.load(f)

    venues_to_remove = set()
    valid_venues = []

    for venue in venues_data["venues"]["venue"]:
        # Check if both latitude and longitude are not empty strings
        if venue.get("latitude") and venue.get("longitude"):
            if venue["latitude"].strip() != "" and venue["longitude"].strip() != "":
                valid_venues.append(venue)
                continue
        venues_to_remove.add(venue["_id"])

    print(f"Found {len(venues_to_remove)} venues to remove (missing coordinates)")
    print(f"Keeping {len(valid_venues)} venues with valid coordinates")

    # Filter events to remove those with invalid venue IDs
    valid_events = []
    events_removed = 0

    for event in events_data["events"]["event"]:
        venue_id = event.get("venueid")
        if venue_id and venue_id not in venues_to_remove:
            valid_events.append(event)
        else:
            events_removed += 1

    print(f"Removed {events_removed} events with invalid venues")
    print(f"Keeping {len(valid_events)} events with valid venues")

    # Save the cleaned data
    updated_venues_data = {"venues": {"venue": valid_venues}}

    updated_events_data = {"events": {"event": valid_events}}

    with open("venues_cleaned.json", "w", encoding="utf-8") as f:
        json.dump(updated_venues_data, f, ensure_ascii=False, indent=2)

    with open("events_cleaned.json", "w", encoding="utf-8") as f:
        json.dump(updated_events_data, f, ensure_ascii=False, indent=2)

    print("Cleaning completed!")
    print("Cleaned venues saved to: venues_cleaned.json")
    print("Cleaned events saved to: events_cleaned.json")


if __name__ == "__main__":
    clean_venues_and_events()
