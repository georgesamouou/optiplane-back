import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Drawer, Box, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/system';

const showErrors = (field, valueLen, min) => {
  if (valueLen === 0) {
    return `${field} field is required`;
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`;
  } else {
    return '';
  }
};

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}));

const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, obj => showErrors('Name', obj.value.length, obj.min))
    .required(),
  email: yup.string().email().required(),
  role: yup.string().required()
});

const AddUserDrawer = ({ open, toggle }) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = data => {
    console.log(data);
    
  };

  return (
    <Drawer anchor='right' open={open} onClose={toggle}>
      <Header>
        <h2>Add User</h2>
        <Button onClick={toggle}>Close</Button>
      </Header>
      <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ p: 4 }}>
        <FormControl fullWidth sx={{ mb: 4 }}>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Name'
                error={Boolean(errors.name)}
                helperText={errors.name ? errors.name.message : ''}
              />
            )}
          />
        </FormControl>
        <FormControl fullWidth sx={{ mb: 4 }}>
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Email'
                error={Boolean(errors.email)}
                helperText={errors.email ? errors.email.message : ''}
              />
            )}
          />
        </FormControl>
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel id='role-select-label'>Role</InputLabel>
          <Controller
            name='role'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId='role-select-label'
                label='Role'
                error={Boolean(errors.role)}
              >
                <MenuItem value='user'>User</MenuItem>
                <MenuItem value='membrepermanent'>Membre permanent</MenuItem>
                <MenuItem value='equipeTTM'>Equipe TTM</MenuItem>
                <MenuItem value='PMODG'>PMODG</MenuItem>
              </Select>
            )}
          />
          {errors.role && <p style={{ color: 'red' }}>{errors.role.message}</p>}
        </FormControl>
        <Button type='submit' variant='contained' color='primary'>
          Add User
        </Button>
      </Box>
    </Drawer>
  );
};

export default AddUserDrawer;
