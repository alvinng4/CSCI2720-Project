import { requestToBackend } from "@/lib/utils";

export async function getEvent(id) {
  if (!id) {
    return { ok: false, error: "Missing event id." };
  }

  return requestToBackend("GET", `events/${id}`);
}

export async function getAllEvents() {
  return await requestToBackend("GET", "events/");
}

export async function createEvent(eventData) {
  if (!(eventData.titleE?.trim() && eventData.location?.trim())) {
    return {
      ok: false,
      error:
        "Missing fields. You must provide title and location for new events",
    };
  }

  return await requestToBackend("POST", "events/", { event: eventData });
}

export async function updateEvent(id, eventData) {
  if (!id) {
    return { ok: false, error: "Missing event id." };
  }

  if (!eventData) {
    return { ok: false, error: "Missing event data." };
  }

  if (eventData.titleE?.trim() === "" || eventData.location?.trim() === "") {
    return {
      ok: false,
      error: "Title or location cannot be empty",
    };
  }

  return await requestToBackend("PUT", `events/${id}`, {
    event: eventData,
  });
}

export async function deleteEvent(id) {
  if (!id) {
    return { ok: false, error: "Missing event id." };
  }

  return await requestToBackend("DELETE", `events/${id}`);
}
