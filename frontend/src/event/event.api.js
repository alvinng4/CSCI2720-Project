import { useEffect, useState } from "react";

import { MessageTypes } from "@/hooks/use-message";
import { requestToBackend } from "@/lib/utils";

export async function getEvent(id, setErrorMsg) {
  setErrorMsg("");

  if (!id) {
    setErrorMsg("Error: Missing event id.");
    return;
  }

  const result = await requestToBackend("GET", `events/${id}`);
  if (!result.ok) {
    setErrorMsg(result?.error || "Error: Something went wrong.");
    return;
  }
  if (!result?.data) {
    setErrorMsg(result?.error || "Error: Something went wrong.");
    return;
  }

  return result.data;
}

export async function getAllEvents(setErrorMsg) {
  setErrorMsg();

  const result = await requestToBackend("GET", "events/");
  if (!result.ok) {
    setErrorMsg(result?.error || "Error: Something went wrong.");
    return;
  }
  if (!result?.data) {
    setErrorMsg(result?.error || "Error: Something went wrong.");
    return;
  }

  return result.data;
}

export async function createEvent(
  eventData,
  showMessage,
  resetMessage,
  onSuccess
) {
  resetMessage();

  if (!(eventData.titleE?.trim() && eventData.location?.trim())) {
    showMessage(
      "Error: Missing fields. You must provide title and location for new events",
      MessageTypes.ERROR
    );
    return;
  }

  const result = await requestToBackend("POST", "events/", {
    event: eventData,
  });
  if (!result.ok) {
    showMessage(
      result?.error || "Error: Something went wrong.",
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

export async function updateEvent(
  id,
  eventData,
  showMessage,
  resetMessage,
  onSuccess
) {
  resetMessage();

  if (!id) {
    showMessage("Error: Missing event id.", MessageTypes.ERROR);
    return;
  }

  const result = await requestToBackend("PUT", `events/${id}`, {
    event: eventData,
  });
  if (!result.ok) {
    showMessage(
      result?.error || "Error: Something went wrong.",
      MessageTypes.ERROR
    );
    return;
  }

  showMessage("Success! Event updated.", MessageTypes.SPECIAL);
  onSuccess();
}

export async function deleteEvent(id, setErrorMsg, refresh) {
  const userConsent = confirm("Delete this event?");
  if (!userConsent) {
    return;
  }

  if (!id) {
    setErrorMsg("Error: Missing event id.");
    return;
  }

  const result = await requestToBackend("DELETE", `events/${id}`);
  if (!result.ok) {
    setErrorMsg(result?.error || "Error: Something went wrong.");
    return;
  }
  refresh();
}

export function useFetchSingleEvent(id) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;

    if (!id) {
      setErrorMsg("Error: missing event Id");
      setLoading(false);
      setEvent(null);
      return;
    }

    (async () => {
      setLoading(true);
      const result = await getEvent(id, setErrorMsg);
      let tempEvent = null;
      if (result) {
        tempEvent = {
          id: result?._id,
          title: result?.titleE,
          location: result?.location,
          preDateE: result?.preDateE,
          progTimeE: result?.progTimeE,
          priceE: result?.priceE,
          descE: result?.descE,
          presenterOrgE: result?.presenterOrgE,
        };
      }

      if (!cancelled) {
        setEvent(tempEvent);
        setLastSyncTime(new Date());
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return {
    event,
    loading,
    errorMsg,
    setErrorMsg,
    lastSyncTime,
    refresh,
  };
}

export function useFetchEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await getAllEvents(setErrorMsg);
      let tempEvents = null;
      if (result) {
        tempEvents = result.map((event) => ({
          id: event?._id,
          title: event?.titleE,
          location: event?.location,
          preDateE: event?.preDateE,
          progTimeE: event?.progTimeE,
          priceE: event?.priceE,
          descE: event?.descE,
          presenterOrgE: event?.presenterOrgE,
        }));
      }

      if (!cancelled) {
        setEvents(tempEvents);
        setLastSyncTime(new Date());
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    events,
    loading,
    errorMsg,
    setErrorMsg,
    lastSyncTime,
    refresh,
  };
}
