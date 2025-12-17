import { requestToBackend } from "@/lib/utils";

export async function getLocation(id) {
  if (!id) {
    return { ok: false, error: "Missing location id." };
  }

  return requestToBackend("GET", `locations/${id}`);
}

export async function getAllLocations() {
  return await requestToBackend("GET", "locations/");
}

export async function createLocation(locationData) {
  /* Check input */
  if (!locationData) {
    return { ok: false, error: "Missing Location Data" };
  }
  if (locationData.nameE == null || locationData.nameE === "") {
    return { ok: false, error: "Missing Fields: name must be provided" };
  }
  if (locationData.district == null || locationData.district === "") {
    return { ok: false, error: "Missing Fields: district must be provided" };
  }
  if (locationData.latitude == null || locationData.latitude === "") {
    return { ok: false, error: "Missing Fields: latitude must be provided" };
  }

  if (locationData.longitude == null || locationData.longitude === "") {
    return { ok: false, error: "Missing Fields: longitude must be provided" };
  }

  /* Send request to backend */
  return await requestToBackend("POST", "locations/", {
    location: locationData,
  });
}

export async function updateLocation(id, locationData) {
  if (!id) {
    return { ok: false, error: "Missing location id." };
  }

  if (!locationData) {
    return { ok: false, error: "Missing location data." };
  }

  if (locationData.nameE === "") {
    return { ok: false, error: "name cannot be updated to empty" };
  }
  if (locationData.district === "") {
    return { ok: false, error: "district cannot be updated to empty" };
  }
  if (locationData.latitude === "") {
    return { ok: false, error: "latitude cannot be updated to empty" };
  }

  if (locationData.longitude === "") {
    return { ok: false, error: "longitude cannot be updated to empty" };
  }

  /* Send request to backend */
  return await requestToBackend("PUT", `locations/${id}`, {
    location: locationData,
  });
}

export async function deleteLocation(id) {
  if (!id) {
    return { ok: false, error: "Missing location id." };
  }

  return await requestToBackend("DELETE", `locations/${id}`);
}
