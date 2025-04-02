// ** React Imports
import { useState, useEffect, forwardRef, useCallback, Fragment, useContext } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify' // Import toast for error notifications

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { Divider, Radio, RadioGroup } from '@mui/material'
import Link from 'next/link'
import MuiFormGenerator from 'src/layouts/components/gouvernanceForm/MuiFormGenerator'
import { start } from 'nprogress'
import { AuthContext } from 'src/context/AuthContext'

const capitalize = string => string && string[0].toUpperCase() + string.slice(1)

const defaultState = {
  url: '',
  title: '',
  guests: [],
  allDay: true,
  description: '',
  endDate: "",
  calendar: 'COMOP',
  startDate: "",
  session: '',
  mode: 'normal',
  optionTTM: '',
  jallonTTM: '',
  natureProjet: '',
  direction: '',
  description: '',
  priority: '',
  objectif: '',
  kpi: '',
  dateSouhaite:""
}

const AddEventSidebar = props => {
  // ** Props
  const {
    store,
    dispatch,
    addEvent,
    updateEvent,
    drawerWidth,
    calendarApi,
    deleteEvent,
    handleSelectEvent,
    addEventSidebarOpen,
    handleAddEventSidebarToggle
  } = props

  const {user} = useContext(AuthContext)

  // ** States
  const [values, setValues] = useState(defaultState)


  const getJallonTTMOptions = () => {
    switch (values.optionTTM) {
      case 'FullTrack':
        return ['T-1', 'T0', 'T1', 'T2', 'T3', 'T4']
      case 'FastTrack':
        return ['T-1', 'T0', 'T3', 'T4']
      default:
        return ['T0', 'T3', 'T4']
    }
  }

  const getPriority = () => {
    switch (values.priority) {
      case 'priority1':
        return ['Objectif1', 'Objectif2', 'Objectif3', 'Objectif4', 'Objectif5', 'Objectif6']
      case 'priority2':
        return ['T-Objectif1', 'TObjectif10', 'TObjectif13', 'TObjectif14']
      default:
        return ['Objectif7', 'Objectif8', 'Objectif9']
    }
  }

  const getObjectif = () => {
    switch (values.objectif) {
      case 'T-Objectif1':
        return ['Objf1', 'Ob2', 'Objf3', 'Obif4', 'Obf5', 'Objf6']
      case 'Objectif1':
        return ['T-Obf1', 'TOif10', 'TObjif13', 'TObf14']
      default:
        return ['Objf7', 'Objf8', 'Objf9']
    }
  }

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const handleSidebarClose = async () => {
    setValues(defaultState)
    clearErrors()
    dispatch(handleSelectEvent(null))
    handleAddEventSidebarToggle()
  }

  const onSubmit = data => {
    // Check if the user has the required role


    const modifiedEvent = {
      url: values.url,
      display: 'block',
      title: data.title,
      end: values.endDate,
      allDay: values.allDay,
      start: values.startDate,
      extendedProps: {
        calendar: capitalize(values.calendar),
        guests: values.guests && values.guests.length ? values.guests : undefined,
        description: values.description.length ? values.description : undefined
      }
    }

    const modifiedEvent_ = {
      type: values.calendar,
      nom: data.title,
      startDate: values.startDate,
      endDate: values.endDate,
      description: values.description,
      title: data.title,
      dateSouhaite: values.startDate,
      direction: user.direction? user.direction: "DG",
      kpi: values.kpi && values.kpi.length? values.kpi: "string",
      modeGouvernance: values.session.length? values.session: "normal",
      guests: "",
      sharepoint: values.url.length? values.url: "url",
      modeTraitement: values.mode.length? values.mode: "normal",
      natureProjet:values.natureProjet && values.natureProjet.length? values.natureProjet: "Nature du projet",
      code: "coo--oo--" + Math.floor(Math.random() * 1000),
      optionTTM: values.optionTTM && values.optionTTM.length? values.optionTTM: "Option",
      jalonTTM: values.jallonTTM && values.jallonTTM.length? values.jallonTTM: "To",
      prioriteStrategique: values.priority && values.priority.length? values.priority: "priority",
      objectifStrategique: values.objectif && values.objectif.length? values.objectif: "objectif",
       createdById: user.id? user.id:1 // Add the user ID as the creator
    }


    if (store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.title.length)) {

      if (!user || user.role !== 'CHEF_DE_PROJET') {
        console.log(!user || !user.role !== 'CHEF_DE_PROJET')
        toast.error('You do not have the required role to create or update events.')

        return
      }
      dispatch(addEvent(modifiedEvent_))
    } else {
      console.log("update event")
      dispatch(updateEvent({id:store.selectedEvent.id, ...modifiedEvent_}))
    }

    calendarApi.refetchEvents()
    handleSidebarClose()
  }

  const handleDeleteEvent = () => {
    if (store.selectedEvent) {
      dispatch(deleteEvent(store.selectedEvent.id))
    }

    // calendarApi.getEventById(store.selectedEvent.id).remove()
    handleSidebarClose()
  }

  const handleDateChange = date => {
    const day = date.getDay()
    const mode = day === 5 || day === 6 || day === 0 ? 'normal' : 'adhoc' // 5: Friday, 6: Saturday, 0: Sunday
    setValues({ ...values, startDate: date, session: mode })
    console.log(mode)
  }

  const handleStartDate = date => {
    if (date > values.endDate) {
      const day = date.getDay()
      const mode = day === 5 || day === 6 || day === 0 ? 'normal' : 'adhoc'
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date), session: mode })
    }
  }

  const resetToStoredValues = useCallback(() => {
    if (store.selectedEvent !== null) {
      const event = store.selectedEvent
      setValue('title', event.title || '')
      setValues({
        url: event.url || '',
        title: event.title || '',
        allDay: event.allDay,
        guests: event.extendedProps.guests || [],
        description: event.extendedProps.description || '',
        calendar: event.extendedProps.calendar || 'COMOP',
        endDate: event.end !== null ? event.end : event.start,
        startDate: event.start !== null ? event.start : new Date(),
        mode: 'normal',
        session: event.start !== null && event.start.getDay() !== (5 || 6 || 0) ? 'adhoc' : 'normal',
        mode: event.extendedProps.modeTraitement || 'normal',
        optionTTM: event.extendedProps.optionTTM || '',
        jallonTTM: event.extendedProps.jalonTTM || '',
        natureProjet: event.extendedProps.natureProjet || '',
        direction: event.extendedProps.direction || '',
        priority: event.extendedProps.prioriteStrategique || '',
        objectif: event.extendedProps.objectifStrategique || '',
        kpi: event.extendedProps.kpi || '',
      })
    }
  }, [setValue, store.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultState)
  }, [setValue])
  useEffect(() => {
    if (store.selectedEvent !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, store.selectedEvent])

  const getDateFieldStyle = () => {
    const day = values.startDate ? values.startDate.getDay() : null
    if (values.session === 'adhoc' && (day === 5 || day === 6 || day === 0)) {
      return { color: 'red' }
    } else if (values.session === 'normal' && day !== 5 && day !== 6 && day !== 0) {
      return { color: 'red' }
    }

    return {}
  }

  const PickersComponent = forwardRef(({ ...props }, ref) => {
    return (
      <TextField
        inputRef={ref}
        fullWidth
        {...props}
        label={props.label || ''}
        sx={{ width: '100%' }}
        style={getDateFieldStyle()}
        error={props.error}
      />
    )
  })

  const RenderSidebarFooter = () => {
    if (store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.title.length)) {
      return (
        <Fragment>
          <Button size='large' type='submit' variant='contained' sx={{ mr: 4 }}>
            Add
          </Button>
          <Button size='large' variant='outlined' color='secondary' onClick={resetToEmptyValues}>
            Reset
          </Button>
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          <Button size='large' type='submit' variant='contained' sx={{ mr: 4 }}>
            Update
          </Button>
          <Button size='large' variant='outlined' color='secondary' onClick={resetToStoredValues}>
            Reset
          </Button>
        </Fragment>
      )
    }
  }

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth] } }}
    >
      {/*<MuiFormGenerator />*/}
      <Box
        className='sidebar-header'
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: 'background.default',
          p: theme => theme.spacing(3, 3.255, 3, 5.255)
        }}
      >
        <Typography variant='h6'>
          {store.selectedEvent !== null && store.selectedEvent.title.length ? 'Update Event' : 'Add Event'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {store.selectedEvent !== null && store.selectedEvent.title.length ? (
            <IconButton
              size='small'
              onClick={handleDeleteEvent}
              sx={{ color: 'text.primary', mr: store.selectedEvent !== null ? 1 : 0 }}
            >
              <Icon icon='mdi:delete-outline' fontSize={20} />
            </IconButton>
          ) : null}
          <IconButton size='small' onClick={handleSidebarClose} sx={{ color: 'text.primary' }}>
            <Icon icon='mdi:close' fontSize={20} />
          </IconButton>
        </Box>
      </Box>
      <Box className='sidebar-body' sx={{ p: theme => theme.spacing(5, 6) }}>
        <DatePickerWrapper>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            <Divider
              sx={{
                '& .MuiDivider-wrapper': { px: 4 },
                mt: theme => `${theme.spacing(5)} !important`,
                mb: theme => `${theme.spacing(7.5)} !important`
              }}
            >
              Instance gouvernance
            </Divider>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <InputLabel id='event-calendar'>Instance</InputLabel>
              <Select
                label='Calendar'
                value={values.calendar}
                labelId='event-calendar'
                onChange={e => setValues({ ...values, calendar: e.target.value })}
              >
                <MenuItem value='COMOP'>COMOP</MenuItem>
                <MenuItem value='CI'>CI</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 6 }}>
              <RadioGroup
                row
                value={values.session}
                name='simple-radio'
                onChange={e => setValues({ ...values, session: e.target.value })}
                aria-label='simple-radio'
              >
                <FormControlLabel value='normal' control={<Radio />} label='Session normal' />
                <FormControlLabel value='adhoc' control={<Radio />} label='Session adhoc' />
              </RadioGroup>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <RadioGroup
                row
                value={values.mode}
                name='simple-radio'
                onChange={e => setValues({ ...values, mode: e.target.value })}
                aria-label='simple-radio'
              >
                <FormControlLabel value='normal' control={<Radio />} label='Mode normal' />
                <FormControlLabel value='restreint' control={<Radio />} label='Mode restreint' />
              </RadioGroup>
            </FormControl>

            {values.calendar === 'COMOP' && (
              <>
                <FormControl fullWidth sx={{ mb: 6 }}>
                  <InputLabel id='event-guests'>Option TTM</InputLabel>
                  <Select
                    label='Guests'
                    value={values.optionTTM}
                    labelId='event-guests'
                    id='event-guests-select'
                    onChange={e => setValues({ ...values, optionTTM: e.target.value })}
                  >
                    <MenuItem value='FullTrack'>Full track</MenuItem>
                    <MenuItem value='FastTrack'>Fast track</MenuItem>
                    <MenuItem value='SuperFastTrack'>Super fast track</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 6 }}>
                  <InputLabel id='event-guests'>Jallon TTM</InputLabel>
                  <Select
                    label='Guests'
                    value={values.jallonTTM}
                    labelId='event-guests'
                    id='event-guests-select'
                    onChange={e => setValues({ ...values, jallonTTM: e.target.value })}
                  >
                    {getJallonTTMOptions().map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  rows={4}
                  fullWidth
                  sx={{ mb: 6 }}
                  label='Nature du projet'
                  id='event-description'
                  value={values.natureProjet}
                  onChange={e => setValues({ ...values, natureProjet: e.target.value })}
                />
              </>
            )}
            <Divider
              sx={{
                '& .MuiDivider-wrapper': { px: 4 },
                mt: theme => `${theme.spacing(5)} !important`,
                mb: theme => `${theme.spacing(7.5)} !important`
              }}
            >
              Nouveau projet
            </Divider>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='title'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField label='Title' value={value} onChange={onChange} error={Boolean(errors.title)} />
                )}
              />
              {errors.title && (
                <FormHelperText sx={{ color: 'error.main' }} id='event-title-error'>
                  This field is required
                </FormHelperText>
              )}
            </FormControl>
            <Box sx={{ mb: 6 }}>
              <DatePicker
                selectsStart
                id='event-start-date'
                endDate={values.endDate}
                selected={values.startDate}
                startDate={values.startDate}
                showTimeSelect={!values.allDay}
                dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                customInput={<PickersComponent label='Start Date' registername='startDate' />}
                style={getDateFieldStyle()}
                onChange={handleDateChange}
                onSelect={handleStartDate}
              />
            </Box>
            <Box sx={{ mb: 6 }}>
              <DatePicker
                selectsEnd
                id='event-end-date'
                style={getDateFieldStyle()}
                endDate={values.endDate}
                selected={values.endDate}
                minDate={values.startDate}
                startDate={values.startDate}
                showTimeSelect={!values.allDay}
                dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                customInput={<PickersComponent label='End Date' registername='endDate' />}
                onChange={handleDateChange}
              />
            </Box>
            <FormControl sx={{ mb: 6 }}>
              <FormControlLabel
                label='All Day'
                control={
                  <Switch checked={values.allDay} onChange={e => setValues({ ...values, allDay: e.target.checked })} />
                }
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <InputLabel id='event-guests'>Guests</InputLabel>
              <Select
                multiple
                label='Guests'
                value={values.guests}
                labelId='event-guests'
                id='event-guests-select'
                onChange={e => setValues({ ...values, guests: e.target.value })}
              >
                <MenuItem value='bruce'>Bruce</MenuItem>
                <MenuItem value='clark'>Clark</MenuItem>
                <MenuItem value='diana'>Diana</MenuItem>
                <MenuItem value='john'>John</MenuItem>
                <MenuItem value='barry'>Barry</MenuItem>
              </Select>
            </FormControl>
            <TextField
              rows={4}
              multiline
              fullWidth
              sx={{ mb: 6 }}
              label='Description'
              id='event-description'
              value={values.description}
              onChange={e => setValues({ ...values, description: e.target.value })}
            />

            <Divider
              sx={{
                '& .MuiDivider-wrapper': { px: 4 },
                mt: theme => `${theme.spacing(5)} !important`,
                mb: theme => `${theme.spacing(7.5)} !important`
              }}
            >
              Allignement plan strategique
            </Divider>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <InputLabel id='event-calendar'>Priorité strategique</InputLabel>
              <Select
                label='Priority'
                value={values.priority}
                labelId='event-calendar'
                onChange={e => setValues({ ...values, priority: e.target.value })}
              >
                <MenuItem value='priority1'>Priority1</MenuItem>
                <MenuItem value='priority2'>priority2</MenuItem>
                <MenuItem value='priority3'>priority3</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <InputLabel id='event-guests'>Objectif strategique</InputLabel>
              <Select
                label='Guests'
                value={values.objectif}
                labelId='event-guests'
                id='event-guests-select'
                onChange={e => setValues({ ...values, objectif: e.target.value })}
              >
                {getPriority().map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <InputLabel id='event-guests'>KPI</InputLabel>
              <Select
                label='Guests'
                value={values.kpi}
                labelId='event-guests'
                id='event-guests-select'
                onChange={e => setValues({ ...values, kpi: e.target.value })}
              >
                {getObjectif().map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type='url'
              id='event-url'
              sx={{ mb: 6 }}
              label='Sharepoint'
              value={values.url}
              onChange={e => setValues({ ...values, url: e.target.value })}
            />
            {values.url !== '' && (
              <a
                href={values.url}
                style={{
                  color: '#F77500',
                  margin: 5,
                  display: 'block',
                  paddingBottom: 3,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Lien vers sharepoint
              </a>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RenderSidebarFooter />
            </Box>
          </form>
        </DatePickerWrapper>
      </Box>
    </Drawer>
  )
}

export default AddEventSidebar
