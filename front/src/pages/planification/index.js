import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Paper,
  Box,
} from '@mui/material';
import authConfig from 'src/configs/auth';

const Planification = () => {
  const [sessions, setSessions] = useState([]);
  const [durations, setDurations] = useState({}); // Store durations for each project

  const token = window.localStorage.getItem(authConfig.storageTokenKeyName);

  // Fetch sessions and projects from the backend
  const fetchSessionsAndProjects = async () => {
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

      // Initialize durations with the difference between startDate and endDate
      const initialDurations = {};
      data.forEach((session) => {
        (session.projects || []).forEach((project) => {
          if (project.startDate && project.endDate) {
            const start = new Date(project.startDate);
            const end = new Date(project.endDate);
            const duration = Math.round((end - start) / 60000); // Calculate duration in minutes
            initialDurations[project.id] = duration;
          }
        });
      });

      setDurations(initialDurations);
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  useEffect(() => {
    fetchSessionsAndProjects();
  }, []);

  // Handle duration change for a project
  const handleDurationChange = async (projectId, value, sessionDate) => {
    try {
      // Calculate the new end time based on the selected duration
      const startTime = new Date(sessionDate);
      const newEndTime = new Date(startTime.getTime() + value * 60000); // Add duration in milliseconds

      // Update the project on the backend
      const response = await fetch('http://localhost:5001/project/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          id: projectId,
          startDate: startTime.toISOString(),
          endDate: newEndTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedProject = await response.json();
      console.log(`Project ${projectId} updated successfully`, updatedProject);

      // Update the durations state
      setDurations((prev) => ({
        ...prev,
        [projectId]: value,
      }));

      // Optionally, refresh sessions to reflect changes
      fetchSessionsAndProjects();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  // Handle scheduling a session
  const handleScheduleSession = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:5001/sessions/${sessionId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to schedule session');
      }

      const data = await response.json();
      console.log(`Session ${sessionId} scheduled successfully`, data);

      // Refresh sessions and projects to reflect changes
      fetchSessionsAndProjects();
    } catch (error) {
      console.error('Failed to schedule session:', error);
    }
  };

  // Calculate the session's end time
  const calculateSessionEndTime = (session) => {
    const startTime = new Date(session.date);
    let totalDuration = 0;

    (session.projects || []).forEach((project) => {
      totalDuration += durations[project.id] || 0; // Add the duration of each project
    });

    const endTime = new Date(startTime.getTime() + totalDuration * 60000); // Add total duration in milliseconds
    return endTime;
  };

  // Format time as hh:mm
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Planification of Sessions
      </Typography>
      {sessions.map((session) => {
        const startTime = new Date(session.date);
        const endTime = calculateSessionEndTime(session);

        return (
          <Box key={session.id} mb={4}>
            {/* Session Title */}
            <Typography variant="h5" gutterBottom>
              {session.nom} - {new Date(session.date).toLocaleDateString()} ({formatTime(startTime)} - {formatTime(endTime)})
            </Typography>

            {/* Schedule Button */}
            <Box mb={2}>
              <button
                style={{
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => handleScheduleSession(session.id)}
              >
                Schedule Session
              </button>
            </Box>

            {/* Projects Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Direction Prescripteur</TableCell>
                    <TableCell>Duration (Minutes)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(session.projects || []).map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.title}</TableCell>
                      <TableCell>{project.user?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Select
                          value={durations[project.id] || ''}
                          onChange={(e) => handleDurationChange(project.id, e.target.value, session.date)}
                          displayEmpty
                          fullWidth
                        >
                          <MenuItem value="" disabled>
                            Select Duration
                          </MenuItem>
                          {[...Array(12)].map((_, index) => {
                            const minutes = (index + 1) * 5;
                            return (
                              <MenuItem key={minutes} value={minutes}>
                                {minutes} minutes
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}
    </Container>
  );
};

export default Planification;