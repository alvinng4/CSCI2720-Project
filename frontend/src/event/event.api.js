import { getToken } from "@/lib/AuthHelpers";
import { MessageTypes } from "@/hooks/use-message";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ?? "http://localhost:4000") + "/api";

export async function createEvent(
  eventData,
  showMessage,
  resetMessage,
  onSuccess
) {
  resetMessage();

  if (!(eventData.titleE?.trim() && eventData.location?.trim())) {
    showMessage(
      "Missing fields. You must provide title and location for new events",
      MessageTypes.ERROR
    );
    return;
  }

  let res = null;
  try {
    res = await fetch(`${API_BASE}/events/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getToken()}`,
      },

      body: JSON.stringify({
        event: eventData,
      }),
    });
  } catch {
    showMessage(
      `Network error. Failed to create location, Please try again later.`,
      MessageTypes.ERROR
    );
    return;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    showMessage(
      "Create location failed. " + (data?.message || "Some error occurred."),
      MessageTypes.ERROR
    );
    return;
  }

  showMessage(
    "Success! Event is created. Refresh to see updates.",
    MessageTypes.SPECIAL
  );
  onSuccess();
}

export async function deleteEvent(id, setErrorMsg, refresh) {
  const userConsent = confirm("Delete this event?");
  if (!userConsent) {
    return;
  }

  let res = null;
  try {
    res = await fetch(`${API_BASE}/events/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getToken()}`,
      },
    });
  } catch {
    setErrorMsg(
      `Network error. Failed to delete event id ${id}, Please try again later.`
    );
    return;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    setErrorMsg(data?.message || "Delete failed");
    return;
  }
  refresh();
}

export async function updateEvent(
  id, 
  eventData, 
  showMessage, 
  resetMessage, 
  onSuccess
) {
  resetMessage();

  if (!id) {
    showMessage("Missing event id.", MessageTypes.ERROR);
    return;
  }

  let res = null;
  try {
    res = await fetch(`${API_BASE}/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ event: eventData }),
    });
  } catch {
    showMessage("Network error. Failed to update event, please try again later.", MessageTypes.ERROR);
    return;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    showMessage("Update failed. " + (data?.message || "Some error occurred."), MessageTypes.ERROR);
    return;
  }

  showMessage("Success! Event updated.", MessageTypes.SPECIAL);
  onSuccess();
}

