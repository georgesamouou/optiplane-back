// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authConfig from 'src/configs/auth';

// ** Axios Imports
import axios from 'axios'
import API_URL from 'src/configs/api';

// ** Fetch Events
export const fetchEvents = createAsyncThunk('appCalendar/fetchEvents', async (calendars, { getState }) => {
  // Retrieve the token from localStorage or state
  const token = window.localStorage.getItem(authConfig.storageTokenKeyName);// Replace 'authToken' with your token key

  if (!token) {
    throw new Error('Authorization token is missing');
  }

  const response = await fetch(`${API_URL}/calendar`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token, // Add the token to the Authorization header
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
});

// ** Add Event
export const addEvent = createAsyncThunk('appCalendar/addEvent', async (event, { dispatch }) => {
  const token = window.localStorage.getItem(authConfig.storageTokenKeyName);// Replace 'authToken' with your token key

  if (!token) {
    throw new Error('Authorization token is missing');
  }

  console.log("response-------",event);

  const response = await fetch(`${API}/project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(event)
  });
  if (!response.ok) {
    throw new Error(`Failed to add event: ${response.statusText}`);
  }
  console.log("response-------",response);
  const data = await response.json();

  // Fetch updated events after adding the new event
  await dispatch(fetchEvents(["COMOP", "CI"]));

  return data;
});

// ** Update Event
export const updateEvent = createAsyncThunk('appCalendar/updateEvent', async (event, { dispatch }) => {
  console.log("event-------",event);

  const response = await fetch(`${API_URL}/project/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });
  if (!response.ok) {
    throw new Error(`Failed to add event: ${response.statusText}`);
  }

  const data = await response.json();

  // Fetch updated events after adding the new event
  await dispatch(fetchEvents(["COMOP", "CI"]));

  return data;
});

// ** Delete Event
export const deleteEvent = createAsyncThunk('appCalendar/deleteEvent', async (id, { dispatch }) => {
  // Retrieve the token from localStorage
  const token = window.localStorage.getItem(authConfig.storageTokenKeyName); // Replace 'authToken' with your token key

  if (!token) {
    throw new Error('Authorization token is missing');
  }

  const response = await fetch(`${API_URL}/project/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token, // Add the token to the Authorization header
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.statusText}`);
  }

  // Fetch updated events after deleting the event
  await dispatch(fetchEvents(["COMOP", "CI"]));

  return await response.json();
})

export const appCalendarSlice = createSlice({
  name: 'appCalendar',
  initialState: {
    events: [],
    selectedEvent: null,
    selectedCalendars: ["COMOP","CI"]
  },
  reducers: {
    handleSelectEvent: (state, action) => {
      state.selectedEvent = action.payload
    },
    handleCalendarsUpdate: (state, action) => {
      const filterIndex = state.selectedCalendars.findIndex(i => i === action.payload)
      if (state.selectedCalendars.includes(action.payload)) {
        state.selectedCalendars.splice(filterIndex, 1)
      } else {
        state.selectedCalendars.push(action.payload)
      }
      if (state.selectedCalendars.length === 0) {
        state.events.length = 0
      }
    },
    handleAllCalendars: (state, action) => {
      const value = action.payload
      if (value === true) {
        state.selectedCalendars = ["COMOP","CI"]
      } else {
        state.selectedCalendars = []
      }
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.events = action.payload
    })
  }
})

export const { handleSelectEvent, handleCalendarsUpdate, handleAllCalendars } = appCalendarSlice.actions

export default appCalendarSlice.reducer
