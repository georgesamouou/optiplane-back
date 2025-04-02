// ** Mock Adapter
import mock from 'src/@fake-db/mock'

const date = new Date()
const nextDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)

const nextMonth =
  date.getMonth() === 11 ? new Date(date.getFullYear() + 1, 0, 1) : new Date(date.getFullYear(), date.getMonth() + 1, 1)

const prevMonth =
  date.getMonth() === 11 ? new Date(date.getFullYear() - 1, 0, 1) : new Date(date.getFullYear(), date.getMonth() - 1, 1)

const data = {
  events: [
    {
      id: "93890a1b-831b-4d13-bddf-5fede74c7317",
      url: '',
      title: 'COMOP Project',
      start: "2025-03-19T10:57:15.9763849",
      end: "2025-03-19T10:57:15.9763872",
      allDay: false,
      extendedProps: {
        calendar: 'COMOP',
        projectType: 'COMOP',
        description: 'This is a COMOP project.'
      }
    },
    {
      id: '0c52aae8-4779-43c0-adac-ecd824ca1810',
      url: '',
      title: 'Meeting With Client',
      start: new Date(date.getFullYear(), date.getMonth() + 1, -11),
      end: new Date(date.getFullYear(), date.getMonth() + 1, -10),
      allDay: true,
      extendedProps: {
        calendar: 'CI'
      }
    },
    {
      id: '0c52aae8-4779-43c0-adac-ecd824ca1810',
      url: '',
      title: 'CI Project',
      start: '2025-03-19T10:58:07.7433291',
      end: '2025-03-19T10:58:07.7433319',
      allDay: true,
      extendedProps: {
        state: 'PMO Validation',
        projectType: 'CI',
        description: 'This is a CI project.',
        calendar: 'CI'
      }
    }
  ]
}

// ------------------------------------------------
// GET: Return calendar events
// ------------------------------------------------
mock.onGet('/apps/calendar/events').reply(config => {
  // Get requested calendars as Array
  const { calendars } = config.params

  return [200, data.events.filter(event => calendars.includes(event.extendedProps.calendar))]
})

// ------------------------------------------------
// POST: Add new event
// ------------------------------------------------
mock.onPost('/apps/calendar/add-event').reply(config => {
  // Get event from post data
  const { event } = JSON.parse(config.data).data
  const { length } = data.events
  let lastIndex = 0
  if (length) {
    lastIndex = data.events[length - 1].id
  }
  event.id = lastIndex + 1
  data.events.push(event)

  return [201, { event }]
})

// ------------------------------------------------
// POST: Update Event
// ------------------------------------------------
mock.onPost('/apps/calendar/update-event').reply(config => {
  const eventData = JSON.parse(config.data).data.event

  // Convert Id to number
  eventData.id = eventData.id
  const event = data.events.find(ev => ev.id ===eventData.id)
  if (event) {
    Object.assign(event, eventData)

    return [200, { event }]
  } else {
    return [400, { error: `Event doesn't exist` }]
  }
})

// ------------------------------------------------
// DELETE: Remove Event
// ------------------------------------------------
mock.onDelete('/apps/calendar/remove-event').reply(config => {
  // Get event id from URL
  const { id } = config.params

  // Convert Id to number
  const eventId = Number(id)
  const eventIndex = data.events.findIndex(ev => ev.id === eventId)
  data.events.splice(eventIndex, 1)

  return [200]
})
