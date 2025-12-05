import xmltodict
import json
import random

random.seed(1234)

event_keys_to_remove = {
    "cat1",
    "cat2",
    "fax",
    "saledate",
    "interbook",
    "prog_image",
    "detail_image1",
    "detail_image2",
    "detail_image3",
    "detail_image4",
    "detail_image5",
    "video_link",
    "video2_link",
}


def to_list(x):
    if isinstance(x, list):
        return x
    if x is None:
        return []
    return [x]


def get_text(field):
    """Handles values like {"#text": "123"} or plain strings"""
    if isinstance(field, dict):
        return field.get("#text", "").strip()
    if field is None:
        return ""
    return str(field).strip()


def clean_venues_and_events():
    print("----------------------------------------")
    with open("venues.xml", "r", encoding="utf-8") as f:
        venues_data = xmltodict.parse(f.read())

    with open("events.xml", "r", encoding="utf-8") as f:
        events_data = xmltodict.parse(f.read())

    venues = to_list(venues_data["venues"]["venue"])
    events = to_list(events_data["events"]["event"])

    random.shuffle(venues)

    venues_to_remove = set()
    valid_venues = []
    seen_coordinates = set()

    for venue in venues:
        lat = get_text(venue.get("latitude"))
        lng = get_text(venue.get("longitude"))

        if lat != "" and lng != "":
            coord = (lat, lng)
            if coord not in seen_coordinates:
                seen_coordinates.add(coord)
                valid_venues.append(venue)
                continue
        venues_to_remove.add(venue.get("@id"))

    print(f"Keeping {len(valid_venues)} / {len(venues)} venues with valid coordinates")

    # Filter events to remove those with invalid venue IDs
    valid_events = []
    events_removed = 0

    for event in events:
        venue_id = get_text(event.get("venueid"))
        if venue_id and venue_id not in venues_to_remove:
            valid_events.append(event)
        else:
            events_removed += 1

    print(f"Keeping {len(valid_events)} / {len(events)} events with valid venues")

    # Pick 10 random venues
    all_valid_venue_ids = [get_text(v.get("@id")) for v in valid_venues if v]
    random_venue_ids = set(random.sample(all_valid_venue_ids, 10))

    filtered_events = [
        e for e in valid_events if get_text(e.get("venueid")) in random_venue_ids
    ]
    filtered_venues = [
        v for v in valid_venues if get_text(v.get("@id")) in random_venue_ids
    ]
    print(
        f"Keeping {len(filtered_venues)} venues and {len(filtered_events)} events (randomly chosen)"
    )

    # Save the cleaned data
    updated_venues_data = []
    for v in filtered_venues:
        v["id"] = get_text(v.get("@id"))
        if "@id" in v:
            del v["@id"]
        updated_venues_data.append(v)
    del filtered_venues

    updated_events_data = []
    for e in filtered_events:
        for k in event_keys_to_remove:
            e.pop(k, None)
        e["id"] = get_text(e.get("@id"))
        if "@id" in e:
            del e["@id"]
        updated_events_data.append(e)
    del filtered_events

    with open("venues_cleaned.json", "w", encoding="utf-8") as f:
        json.dump(updated_venues_data, f, ensure_ascii=False, indent=2)

    with open("events_cleaned.json", "w", encoding="utf-8") as f:
        json.dump(updated_events_data, f, ensure_ascii=False, indent=2)

    print()
    print("Preprocessing completed!")
    print("Cleaned venues saved to: venues_cleaned.json")
    print("Cleaned events saved to: events_cleaned.json")
    print("----------------------------------------")


if __name__ == "__main__":
    clean_venues_and_events()
