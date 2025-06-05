// ** React Import
import { useContext, useEffect, useRef } from 'react'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import interactionPlugin from '@fullcalendar/interaction'

// ** Third Party Style Import
import 'bootstrap-icons/font/bootstrap-icons.css'
import { AuthContext } from 'src/context/AuthContext'
import { toast } from 'react-toastify'; // Import toast for error messages

const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    location: '',
    description: ''
  }
}

const Calendar = props => {
  // ** Props
  const {
    store,
    dispatch,
    direction,
    updateEvent,
    calendarApi,
    calendarsColor,
    setCalendarApi,
    handleSelectEvent,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle
  } = props
  const {user} = useContext(AuthContext)

  // ** Refs
  const calendarRef = useRef()
  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
  }, [calendarApi, setCalendarApi])
  if (store) {
    // ** calendarOptions(Props)

    const calendarOptions = {
      events: store.events.length ? store.events : [],
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        start: 'sidebarToggle, prev, next, title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      views: {
        week: {
          titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
        }
      },

      /*
            Enable dragging and resizing event
            ? Docs: https://fullcalendar.io/docs/editable
          */
      editable: true,

      /*
            Enable resizing event from start
            ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
          */
      eventResizableFromStart: true,

      /*
              Automatically scroll the scroll-containers during event drag-and-drop and date selecting
              ? Docs: https://fullcalendar.io/docs/dragScroll
            */
      dragScroll: true,

      /*
              Max number of events within a given day
              ? Docs: https://fullcalendar.io/docs/dayMaxEvents
            */
      dayMaxEvents: 2,

      /*
              Determines if day names and week names are clickable
              ? Docs: https://fullcalendar.io/docs/navLinks
            */
      navLinks: true,
      eventClassNames({ event: calendarEvent }) {
        // @ts-ignore
        const calendarType = calendarEvent._def.extendedProps.calendar? calendarEvent._def.extendedProps.calendar : calendarEvent._def.extendedProps.type;
        console.log('calendarType', calendarType)  
        // Assign a specific class based on the calendar type
        if (calendarType === 'COMOP') {
          return ['bg-primary', 'text-white']; // Example: Blue background with white text
        } else if (calendarType === 'CI') {
          return ['bg-success', 'text-white']; // Example: Green background with white text
        } else {
          return ['bg-secondary', 'text-white']; // Default style
        }
      },
      eventClick({ event: clickedEvent }) {
        if (user.role === 'CHEF_DE_PROJET' && clickedEvent._def.extendedProps.state != 'INITIATION') {
          toast.success('Votre projet est en cours de validation vous ne pouvez modifier.');

          return;
        }
        dispatch(handleSelectEvent(clickedEvent))
        handleAddEventSidebarToggle()

        // * Only grab required field otherwise it goes in infinity loop
        // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
        // event.value = grabEventDataFromEventApi(clickedEvent)
        // isAddNewEventSidebarActive.value = true
      },
      eventContent({ event }) {
        // Use only the title without any prefix
        return { html: `<div>${event.title}</div>` };
      },
      customButtons: {
        sidebarToggle: {
          icon: 'bi bi-list',
          click() {
            handleLeftSidebarToggle()
          }
        }
      },
      dateClick(info) {
        // Check user role and event state



        const day = info.date.getDay()
        const today = new Date()
        const clickedDate = new Date(info.date)
        const nextFriday = new Date(clickedDate)
        nextFriday.setDate(clickedDate.getDate() + 7);

        const diffDays = Math.abs(clickedDate.getDate() - today.getDate())
        console.log('diffDays', diffDays)
        console.log('nextfriday', nextFriday)

        //const day = info.date.getDay()
        if (day === 0 || day === 6) {
          // Disable click on Saturday and Sunday
          return false
        } else if( day === 5 ){

          if (diffDays > 5) {
            const ev = { ...blankEvent }
            ev.start = clickedDate
            ev.end = clickedDate
            ev.allDay = true
            dispatch(handleSelectEvent(ev))
            handleAddEventSidebarToggle()

          }else{
            const ev = { ...blankEvent }
            ev.start = nextFriday
            ev.end = nextFriday
            ev.allDay = true
            dispatch(handleSelectEvent(ev))
            handleAddEventSidebarToggle()
          }

          // Handle the click event for other days

        }else{
          // Handle the click event for other days
          const ev = { ...blankEvent }
          ev.start = info.date
          ev.end = info.date
          ev.allDay = true
          dispatch(handleSelectEvent(ev))
          handleAddEventSidebarToggle()
        }
      },

      /*
              Handle event drop (Also include dragged event)
              ? Docs: https://fullcalendar.io/docs/eventDrop
              ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
            */
      eventDrop({ event: droppedEvent, revert }) {
        if (user.role === 'CHEF_DE_PROJET' && droppedEvent._def.extendedProps.state != 'INITIATION') {
          // Show a toast message
          toast.success('Votre projet est en cours de validation vous ne pouvez modifier.');

          // Revert the event to its original position
          revert();

          return;
        }

        const updatedEvent = {
          ...droppedEvent.extendedProps,
          startDate: new Date(droppedEvent._instance.range.start),
          endDate: new Date(droppedEvent._instance.range.end)
        };

        // Dispatch the updated event
        dispatch(updateEvent(updatedEvent));
      },

      /*
              Handle event resize
              ? Docs: https://fullcalendar.io/docs/eventResize
            */
      eventResize({ event: resizedEvent }) {
        // Create an updated event object with properly formatted dates
        if (user.role === 'CHEF_DE_PROJET' && resizedEvent._def.extendedProps.state != 'INITIATION') {
          toast.success('Votre projet est en cours de validation vous ne pouvez modifier.');

          return;
        }
        const updatedEvent = {
          ...resizedEvent.extendedProps,
          startDate: resizedEvent.start.toISOString(),
          endDate: resizedEvent.end ? resizedEvent.end.toISOString() : resizedEvent.start.toISOString()
        };

        // Dispatch the updated event
        dispatch(updateEvent(updatedEvent));
      },
      ref: calendarRef,

      // Get direction from app state (store)
      direction
    }

    // @ts-ignore
    return <FullCalendar {...calendarOptions} />
  } else {
    return null
  }
}

export default Calendar
