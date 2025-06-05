import React, { useEffect, useContext, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Drawer, TextField, MenuItem, Select, InputLabel, FormControl, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, ToggleButtonGroup, ToggleButton, Typography, Checkbox, FormControlLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AuthContext } from 'src/context/AuthContext';
import authConfig from 'src/configs/auth';
import API_URL from 'src/configs/api';
import { gu } from 'date-fns/locale';

const ProjetTable = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]); // For filtered results
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTitle, setSearchTitle] = useState(''); // For title search
  const [selectedState, setSelectedState] = useState(''); // For state filter
  const [storedToken, setStoredToken] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false); // State to manage dialog visibility
  const [newProject, setNewProject] = useState({
    title: '',
    direction: '',
    state: '',
    startDate: '',
    calendar: 'COMOP',
    nom:'',
    code : "coo--oo--" + Math.floor(Math.random() * 1000)
  }); // State to manage new project data
  const { user } = useContext(AuthContext);
  const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
  const checklistMapping = {
    'T-1': ['Element plan marketing', 'Pré-faisabilité technique'],
    'T0': [
      'Objectifs & enjeux',
      'Proposition de valeur et bénéfices clients',
      'Analyse SWOT',
      'Analyse du marché',
      'Plan d’Expérience client',
      'Plan de tests CTC : compréhension des offres',
      'Résultats tests de concept si applicable',
      'Parcours client cible',
      'Plan Go-to-Market',
      'Architecture technique',
      'Checklist Analyse des risques de sécurité -SRA',
      'Business model',
      'Business plan',
      'Points clés (réglementaire, achats)',
    ],
    'T3': [
      'Rappels éléments plan marketing',
      'Validation Parcours client final',
      'Résultats tests / FUT et actions correctives',
      'Plan de gestion des dysfonctionnements',
      'Business model',
      'Business plan',
      'Dispositif GoToMarket',
      'Dispositif Communication',
      'Rappel points clés',
      'Validation risques résiduels de sécurité',
      'Validation SG – RAF- Achats',
    ],
    'T4': [
      'KPI financiers',
      'KPI opérationnels',
      'KPI de mesure CX : Résultats PeK ou post-test',
      'KPI de simplicité du Parcours client',
      'Compliance document',
      'Bilan du projet',
    ],
  };
  // Fetch projects from the backend
  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token, // Ensure the token is passed in the headers
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched projects:', data);

      setProjects(data); // Set the projects state
      setFilteredProjects(data); // Initialize filtered projects
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Call fetchProjects when the component loads
  useEffect(() => {
    const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
    setStoredToken(token); // Store the token in state
    fetchProjects();
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
    const {guests,...data} = project; // Destructure to remove guest property
    setSelectedProject(data);
    setIsDrawerOpen(true);
  };

  // Handle closing the drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProject(null);
  };
  console.log('Selected Project:', selectedProject?.jallonTTM);
  // Handle updating the project
  const handleUpdateProject = async () => {
    if (user.role === 'PMO_DIRECTION') {
      setIsSaveDialogOpen(true); // Open the dialog
      return;
    }
    try {
      const response = await fetch(`${API_URL}/project/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
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

  // Handle opening the create project dialog
  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  // Handle closing the create project dialog
  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setNewProject({ title: '', direction: '', state: '', startDate: '' }); // Reset form
  };

  // Handle creating a new project
  const handleCreateProject = async () => {
    setNewProject({ ...newProject, nom: newProject.title });
    setNewProject({ ...newProject, code : "coo--oo--" + Math.floor(Math.random() * 1000) });
    console.log('Creating project:', newProject);
    try {
      const response = await fetch(`${API_URL}/project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Project created:', data);

      // Refresh the project list
      fetchProjects();
      handleCloseCreateDialog();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <>
      <h1>Projects</h1>

      {/* Create Project Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Project
        </Button>
      </Box>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create Project</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Instance (Calendar) */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="project-calendar">Instance</InputLabel>
              <Select
                labelId="project-calendar"
                value={newProject.calendar || 'COMOP'}
                onChange={(e) => setNewProject({ ...newProject, calendar: e.target.value })}
              >
                <MenuItem value="COMOP">COMOP</MenuItem>
                <MenuItem value="CI">CI</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <ToggleButtonGroup
                value={newProject.modeGouvernance || 'normal'}
                exclusive
                onChange={(e, value) => {
                  if (value !== null) {
                    setNewProject({ ...newProject, modeGouvernance: value });
                  }
                }}
                aria-label="Mode de Gouvernance"
              >
                <ToggleButton value="normal" aria-label="Normal">
                  Normal
                </ToggleButton>
                <ToggleButton value="adhoc" aria-label="Adhoc">
                  Adhoc
                </ToggleButton>
              </ToggleButtonGroup>
            </FormControl>
            {/* Option TTM */}
            {newProject.calendar === 'COMOP' && (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="project-option-ttm">Option TTM</InputLabel>
                  <Select
                    labelId="project-option-ttm"
                    value={newProject.optionTTM || ''}
                    onChange={(e) => setNewProject({ ...newProject, optionTTM: e.target.value })}
                  >
                    <MenuItem value="FullTrack">Full track</MenuItem>
                    <MenuItem value="FastTrack">Fast track</MenuItem>
                    <MenuItem value="SuperFastTrack">Super fast track</MenuItem>
                  </Select>
                </FormControl>

                {/* Jallon TTM */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="project-jallon-ttm">Jallon TTM</InputLabel>
                  <Select
                    labelId="project-jallon-ttm"
                    value={newProject.jallonTTM || ''}
                    onChange={(e) => setNewProject({ ...newProject, jallonTTM: e.target.value })}
                  >
                    {['T-1', 'T0', 'T1', 'T2', 'T3', 'T4'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* Nature du projet */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="project-nature">Nature du projet</InputLabel>
              <Select
                labelId="project-nature"
                value={newProject.natureProjet || ''}
                onChange={(e) => setNewProject({ ...newProject, natureProjet: e.target.value })}
              >
                <MenuItem value="Outils">Outils</MenuItem>
                <MenuItem value="Offres">Offres</MenuItem>
                <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                <MenuItem value="Autres">Autres</MenuItem>
              </Select>
            </FormControl>

            {/* Title */}
            <TextField
              label="Title"
              value={newProject.title || ''}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              fullWidth
            />

            {/* Start Date */}
            <TextField
              label="Start Date"
              type="date"
              value={newProject.startDate || ''}
              onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            {/* Description */}
            <TextField
              label="Description"
              value={newProject.description || ''}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateProject} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

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
              {Object.keys(selectedProject)
                .filter(
                  (key) =>
                    ![
                      'id',
                      'nom',
                      'startDate',
                      'endDate',
                      'guest',
                      'sessionId',
                      'decisionId',
                      'createdBy',
                      'session',
                      'createdById',
                      'guests',
                      'sharepoint',
                      'code',
                      'modeGouvernance',
                      'state'
                    ].includes(key) // Exclude these fields
                )
                .map((key) => (
                  <TextField
                    key={key}
                    disabled={!isEditable}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={selectedProject[key] || ''}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                    InputLabelProps={
                      key === 'startDate' || key === 'endDate' ? { shrink: true } : undefined
                    }
                    type={key === 'startDate' || key === 'endDate' ? 'date' : 'text'}
                  />
                ))}

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
      <Dialog open={isSaveDialogOpen} onClose={() => setIsSaveDialogOpen(false)} fullWidth maxWidth="sm">
  <DialogTitle>Checklist for Validation</DialogTitle>
  <DialogContent>
    <Typography variant="body1" sx={{ mb: 2 }}>
      Please review the checklist for <strong>{selectedProject?.title}</strong> based on the Jallon TTM: <strong>{selectedProject?.jallonTTM}</strong>.
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {checklistMapping[selectedProject?.jallonTTM || 'T0']?.map((item, index) => (
        <FormControlLabel
          key={index}
          control={<Checkbox />}
          label={item}
        />
      )) || (
        <Typography variant="body2" color="textSecondary">
          No checklist available for the selected Jallon TTM.
        </Typography>
      )}
    </Box>
    <TextField
      label="Additional Comments"
      placeholder="Enter any additional comments or notes"
      multiline
      rows={4}
      fullWidth
      sx={{ mt: 2 }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setIsSaveDialogOpen(false)} color="secondary">
      Cancel
    </Button>
    <Button
      onClick={async () => {
        try {
          const response = await fetch(`${API_URL}/project/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token,
            },
            body: JSON.stringify(selectedProject),
          });
          if (!response.ok) {
            throw new Error(`Failed to update project: ${response.statusText}`);
          }

          const data = await response.json();
          console.log(data);
          setIsSaveDialogOpen(false); // Close the dialog
          setIsDrawerOpen(false); // Close the drawer
        } catch (error) {
          console.error('Error updating project:', error);
        }
      }}
      color="primary"
    >
      Confirm
    </Button>
  </DialogActions>
</Dialog>
    </>
  );
};

export default ProjetTable;
