// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'


import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Actions Imports
import { fetchData, deleteUser } from 'src/store/apps/user'

// ** Third Party Components
import axios from 'axios'

// ** Custom Table Components Imports

import AddUserDrawer from 'src/views/apps/user/list/AddUserDrawer'
import { color } from '@mui/system'


// ** renders client column
const renderClient = row => {
  if (row.avatar.length) {
    return <CustomAvatar src={row.avatar} sx={{ mr: 3, width: 34, height: 34 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={row.avatarColor || 'primary'}
        sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
      >
        {getInitials(row.fullName ? row.fullName : 'John Doe')}
      </CustomAvatar>
    )
  }
}


const getRoleStyle = (role) => {
  switch (role) {
    case 'prescripteur':
      return { backgroundColor: '#FFD700',  }; // Gold
    case 'equipeTTM':
      return { backgroundColor: '#1E90FF', }; // DodgerBlue
    case 'admin':
      return { backgroundColor: '#FF4500', }; // OrangeRed
    case 'DG':
      return { backgroundColor: '#32CD32', }; // LimeGreen
    default:
      return { padding: '4px 8px', borderRadius: '4px' };
  }
};

const columns = [
  { field: 'name', headerName: 'Name', flex: 0.2, minWidth: 150 },
  { field: 'email', headerName: 'Email', flex: 0.2, minWidth: 100 },
  {
    field: 'role',
    headerName: 'Role',
    flex: 0.2, minWidth: 100,
    renderCell: (params) => (
      <div style={{ ...getRoleStyle(params.value), color: '#fff', borderRadius: '4px', padding: "0px 5px" }}>
        {params.value}
      </div>
    )
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.1,
    minWidth: 100,

  },
  {
    flex: 0.2,
    minWidth: 100,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: (params) => (
      <>
        <IconButton component={Link} href={`/apps/user/view/overview/${params.row.id}`}>
          <Icon path="mdi:eye-outline" size={10} style={{color: "white"}} />
        </IconButton>
        <IconButton component={Link} href={`/apps/user/edit/${params.row.id}`}>
          <Icon path="mdi:pencil-outline" size={1} />
        </IconButton>
        <IconButton onClick={() => handleDelete(params.row.id)}>
          <Icon path="mdi:delete-outline" size={1} />
        </IconButton>
      </>

    )
  }
]

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'prescripteur', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'equipeTTM', status: 'inactive' },
  { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'admin', status: 'active' },
  { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', role: 'DG', status: 'inactive' },
  { id: 5, name: 'Charlie Davis', email: 'charlie.davis@example.com', role: 'equipeTTM', status: 'active' }
]

const UserList = () => {
  // ** State
  const [status, setStatus] = useState('')
  const [role, setRole] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.user)
  useEffect(() => {
    dispatch(
      fetchData({
        role: '',
        status: '',
        q: ''
      })
    )
  }, [dispatch])

  const handleStatusChange = (event) => {
    setStatus(event.target.value)
  }

  const handleRoleChange = (event) => {
    setRole(event.target.value)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const toggleAddUserDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const filteredRows = sampleData
    .filter(row => row.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(row => (status ? row.status === status : true))
    .filter(row => (role ? row.role === role : true));

  return (
    <Card>
      <CardHeader title='User List' />
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <TextField
                    label="Search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    fullWidth
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id='status-select'>Select Status</InputLabel>
                  <Select
                    fullWidth
                    value={status}
                    id='select-status'
                    label='Select Status'
                    labelId='status-select'
                    onChange={handleStatusChange}
                  >
                    <MenuItem value=''>All Statuses</MenuItem>
                    <MenuItem value='active'>Active</MenuItem>
                    <MenuItem value='inactive'>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id='role-select'>Select Role</InputLabel>
                  <Select
                    fullWidth
                    value={role}
                    id='select-role'
                    label='Select Role'
                    labelId='role-select'
                    onChange={handleRoleChange}
                  >
                    <MenuItem value=''>All Roles</MenuItem>
                    <MenuItem value='user'>User</MenuItem>
                    <MenuItem value='equipeTTM'>Equipe TTM</MenuItem>
                    <MenuItem value='admin'>admin</MenuItem>
                    <MenuItem value='DG'>DG</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" color="primary" onClick={toggleAddUserDrawer}>
              Add User
            </Button>
          </Box>
          <DataGrid
            autoHeight
            rows={filteredRows}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
          />
        </Grid>
      </Grid>
      <AddUserDrawer open={drawerOpen} toggle={toggleAddUserDrawer} />
    </Card>
  )
}

export const getStaticProps = async () => {
  const res = await axios.get('/cards/statistics')
  const apiData = res.data

  return {
    props: {
      apiData
    }
  }
}

export default UserList
