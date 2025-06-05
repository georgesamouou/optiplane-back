import React, { useState, useEffect } from 'react';
import authConfig from 'src/configs/auth';
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const SessionPage = () => {
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newSession, setNewSession] = useState({
    titre: '',
    nom: '',
    lieu: '',
    description: '',
    date: '',
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const token = window.localStorage.getItem(authConfig.storageTokenKeyName);

  // Fetch sessions from the backend
  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:5001/sessions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  // Fetch projects from the backend
  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5001/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      console.log('Fetched projects:', data); // Log the fetched projects
      setProjects(data); // Ensure the projects state is updated with the fetched data
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchProjects(); // Fetch all projects when the component mounts
  }, []);

  // Create a new session
  const createSession = async () => {
    if (newSession.titre && newSession.nom && newSession.lieu && newSession.description && newSession.date) {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify(newSession),
        });
        if (!response.ok) {
          throw new Error('Failed to create session');
        }
        const data = await response.json();
        setSessions([...sessions, data]);
        setNewSession({ titre: '', nom: '', lieu: '', description: '', date: '' });
      } catch (error) {
        console.error('Failed to create session:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Automatic import of projects based on session date
  const automaticImport = async () => {
    if (newSession.date) {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/session/by-date', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify(newSession),
        });
        if (!response.ok) {
          throw new Error('Failed to automatically import projects');
        }
        const data = await response.json();
        console.log('Automatic Import Success:', data);
        fetchSessions(); // Refresh sessions after import
        fetchProjects(); // Refresh projects after import
        setNewSession({ titre: '', nom: '', lieu: '', description: '', date: '' });
      } catch (error) {
        console.error('Failed to automatically import projects:', error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error('Date is required for automatic import');
    }
  };

  // Add a project to a session
  const addProjectToSession = async () => {
    if (selectedSession && selectedProject) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/sessions/${selectedSession}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({ projectIds: [selectedProject] }),
        });
        if (!response.ok) {
          throw new Error('Failed to add project to session');
        }
        fetchSessions(); // Refresh sessions after adding the project
        fetchProjects(); // Refresh projects after adding the project
        setDialogOpen(false);
        setSelectedSession(null);
        setSelectedProject(null);
      } catch (error) {
        console.error('Failed to add project to session:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Remove a project from a session
  const removeProjectFromSession = async (projectId, sessionId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/sessions/${sessionId}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to remove project from session');
      }
      const data = await response.json();
      console.log(data.message); // Log success message
      fetchSessions(); // Refresh sessions after removing the project
      fetchProjects(); // Refresh projects after removing the project
    } catch (error) {
      console.error('Failed to remove project from session:', error);
    } finally {
      setLoading(false);
    }
  };

 

  // Delete a session
  const deleteSession = async (sessionId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete session');
      }
      const data = await response.json();
      console.log(data.message); // Log success message
      fetchSessions(); // Refresh sessions after deleting the session
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Session Management
      </Typography>

      {/* Create a New Session */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Create a New Session
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Titre"
              value={newSession.titre}
              onChange={(e) => setNewSession({ ...newSession, titre: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nom"
              value={newSession.nom}
              onChange={(e) => setNewSession({ ...newSession, nom: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Lieu"
              value={newSession.lieu}
              onChange={(e) => setNewSession({ ...newSession, lieu: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description"
              value={newSession.description}
              onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={newSession.date}
              onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={createSession}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Session'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={automaticImport}
              disabled={loading}
              style={{ marginLeft: '10px' }}
            >
              {loading ? 'Importing...' : 'Automatic Import'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Projects Table */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Projects Overview
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Project Date</TableCell> {/* New Column */}
                <TableCell>Session</TableCell>
                <TableCell>Session Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => {
                const session = sessions.find((s) => s.id === project.sessionId);
                return (
                  <TableRow key={project.id}>
                    <TableCell>{project.title}</TableCell>
                    <TableCell>
                      {project.startDate
                        ? `${new Date(project.startDate).toLocaleDateString()} `
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{session ? session.nom : 'No Session'}</TableCell>
                    <TableCell>{session ? session.date : 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setSelectedProject(project.id);
                          setDialogOpen(true);
                        }}
                      >
                        Add to Session
                      </Button>
                      {project.sessionId && (
                        <IconButton
                          color="secondary"
                          onClick={() => removeProjectFromSession(project.id, project.sessionId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add Project to Session Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Project to Session</DialogTitle>
        <DialogContent>
          {/* Preselect the project */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Selected Project</InputLabel>
            <Select value={selectedProject || ''} disabled>
              {projects
                .filter((project) => project.id === selectedProject)
                .map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.title}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Select a session */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Select a Session</InputLabel>
            <Select
              value={selectedSession || ''}
              onChange={(e) => setSelectedSession(Number(e.target.value))}
            >
              <MenuItem value="" disabled>
                Select a Session
              </MenuItem>
              {sessions.map((session) => (
                <MenuItem key={session.id} value={session.id}>
                  {session.nom} ({session.date})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={addProjectToSession} color="primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sessions Overview */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Sessions Overview
        </Typography>
        {sessions.map((session) => (
          <Card key={session.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{session.nom}</Typography>
              <Typography variant="body2" color="textSecondary">
                {session.date}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {session.lieu}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {session.description}
              </Typography>
              <List>
                {(session.projects || []).map((project) => (
                  <ListItem key={project.id}>
                    <ListItemText primary={project.name} />
                  </ListItem>
                ))}
              </List>
              {/* Auto Import and Delete Session Buttons */}
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setNewSession({ ...newSession, date: session.date });
                    automaticImport(); // Use the existing automaticImport function
                  }}
                  style={{ marginRight: '10px' }}
                >
                  Auto Import
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => deleteSession(session.id)}
                >
                  Delete Session
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default SessionPage;