import React, { useEffect, useContext, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Drawer, TextField, MenuItem, Select, InputLabel, FormControl, Box, Chip } from '@mui/material';
import { AuthContext } from 'src/context/AuthContext';
import authConfig from 'src/configs/auth';

const ProjetTable = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]); // For filtered results
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTitle, setSearchTitle] = useState(''); // For title search
  const [selectedState, setSelectedState] = useState(''); // For state filter
  const [storedToken, setStoredToken] = useState(null);
  const { user } = useContext(AuthContext);

  // Fetch projects when the component loads
  useEffect(() => {
    const token = window.localStorage.getItem(authConfig.storageTokenKeyName);


    if (token && user?.id) {
      fetch(`http://localhost:5001/project/invalide`, {
        method: 'GET',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
          }

          return response.json();
        })
        .then((data) => {
          console.log("Fetched projects:", data);
          setProjects(data);
          setFilteredProjects(data);
        })
        .catch((error) => {
          console.error('Error fetching projects:', error);
        });
    }
  }, []);

  // Dynamically set state options based on user role
  const stateOptions = (() => {
    switch (user.role) {
      case 'CHEF_DE_PROJET':
        return ['INITIATION', 'PMO_VALIDATION'];
      case 'PMO_DIRECTION':
        return ['INITIATION', 'PMO_VALIDATION', 'TTM_VALIDATION'];
      case 'EQUIPE_TTM':
        return ['INITIATION', 'PMO_VALIDATION', 'TTM_VALIDATION', 'SCHEDULED'];
      default:
        return ['INITIATION', 'PMO_VALIDATION', 'TTM_VALIDATION', 'SCHEDULED'];
    }
  })();

  // Determine if Save button and state dropdown should be enabled
  const isEditable = (() => {
    if (!selectedProject) return false;

    const { role } = user;
    const { state } = selectedProject;

    if (role === 'CHEF_DE_PROJET' && state === 'INITIATION') {
      return true;
    }
    if (role === 'PMO_DIRECTION' && (state === 'INITIATION' || state === 'PMO_VALIDATION')) {
      return true;
    }
    if (role === 'EQUIPE_TTM') {
      return true;
    }

    return false;
  })();

  // Handle opening the drawer with the selected project
  const handleViewProject = (project) => {
    setSelectedProject(project);
    setIsDrawerOpen(true);
  };

  // Handle closing the drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProject(null);
  };

  // Handle updating the project
  const handleUpdateProject = async () => {
    try {
      const response = await fetch('http://localhost:5001/project/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedProject),
      });
      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  // Handle changes in the editable fields
  const handleFieldChange = (field, value) => {
    setSelectedProject((prev) => ({ ...prev, [field]: value }));
  };

  // Handle search by title
  const handleSearchTitle = (e) => {
    const value = e.target.value;
    setSearchTitle(value);
    filterProjects(value, selectedState);
  };

  // Handle filter by state
  const handleFilterState = (e) => {
    const value = e.target.value;
    setSelectedState(value);
    filterProjects(searchTitle, value);
  };

  // Filter projects based on title and state
  const filterProjects = (title, state) => {
    const filtered = projects.filter((project) => {
      const matchesTitle = title ? project.title.toLowerCase().includes(title.toLowerCase()) : true;
      const matchesState = state ? project.state === state : true;

      return matchesTitle && matchesState;
    });
    setFilteredProjects(filtered);
  };

  // Function to get color for state tags
  const getStateColor = (state) => {
    switch (state) {
      case 'INITIATION':
        return 'primary';
      case 'PMO_VALIDATION':
        return 'secondary';
      case 'TTM_VALIDATION':
        return 'warning';
      case 'SCHEDULED':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <>
      <h1>Projects non-valide</h1>

      {/* Search and Filter Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* Search by Title */}
        <TextField
          label="Search by Title"
          value={searchTitle}
          onChange={handleSearchTitle}
          fullWidth
        />

        {/* Filter by State */}
        <FormControl fullWidth>
          <InputLabel id="state-filter-label">Filter by State</InputLabel>
          <Select
            labelId="state-filter-label"
            value={selectedState}
            onChange={handleFilterState}
          >
            <MenuItem value="">All States</MenuItem>
            {stateOptions.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Chef de projet</TableCell>
              <TableCell>Direction</TableCell>
              <TableCell>Etat</TableCell>
              <TableCell>Data souhaité</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.title}</TableCell>
                <TableCell>{project.createdBy?.username || 'N/A'}</TableCell>
                <TableCell>{project.direction}</TableCell>
                <TableCell>
                  <Chip
                    label={project.state}
                    color={getStateColor(project.state)}
                    variant="outlined"
                    sx={{ borderRadius: '16px' }}
                  />
                </TableCell>
                <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleViewProject(project)}>
                    Soumettre
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Event Sidebar */}
      <Drawer anchor="right" open={isDrawerOpen} onClose={handleCloseDrawer}>
        <Box sx={{ width: 400, p: 3 }}>
          <h2>Edit Project</h2>
          {selectedProject && (
            <>
              {Object.keys(selectedProject).map((key) => {
                if (typeof selectedProject[key] === 'object' && selectedProject[key] !== null) {
                  return null;
                }

                return (
                  <TextField
                    key={key}
                    disabled={!isEditable}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={selectedProject[key] || ''}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                    InputLabelProps={key === 'startDate' || key === 'endDate' ? { shrink: true } : undefined}
                    type={key === 'startDate' || key === 'endDate' ? 'date' : 'text'}
                  />
                );
              })}

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="state-label">State</InputLabel>
                <Select
                  labelId="state-label"
                  value={selectedProject.state}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
                  disabled={!isEditable}
                >
                  {stateOptions.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateProject}
                sx={{ mr: 2 }}

              >
                Save
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleCloseDrawer}>
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default ProjetTable;
