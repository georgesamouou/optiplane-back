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
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
} from '@mui/material';
import authConfig from 'src/configs/auth';

const DecisionTable = () => {
  const [decisions, setDecisions] = useState([]); // Store decisions from the backend
  const [updatedDecision, setUpdatedDecision] = useState(null); // Track the decision being updated
  const [dialogOpen, setDialogOpen] = useState(false); // Dialog state
  const [stepperOpen, setStepperOpen] = useState(false); // Stepper dialog state
  const [activeStep, setActiveStep] = useState(0); // Active step in the stepper
  const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
  const steps = ['Informations', 'Présence', 'Decision']; // Stepper steps
  const [selectedProject, setSelectedProject] = useState(null); // Track the selected project for the stepper

  const openStepper = () => {
    setStepperOpen(true);
  };
  const closeStepper = () => {
    setStepperOpen(false);
    setActiveStep(0); // Reset to the first step
  };
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const sumDecisions = (decisions) => {
    openStepper();
    setSelectedProject(decisions.project); // Set the selected project for the stepper
  }

  // Fetch decisions from the backend
  const fetchDecisions = async () => {
    try {
      const response = await fetch('http://localhost:5001/decisions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch decisions');
      }
      const data = await response.json();
      setDecisions(data);
    } catch (error) {
      console.error('Failed to fetch decisions:', error);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  // Open the dialog and set the selected decision
  const openDialog = (decision) => {
    setUpdatedDecision({ ...decision });
    setDialogOpen(true);
  };

  // Close the dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setUpdatedDecision(null);
  };

  // Handle field changes in the dialog
  const handleFieldChange = (field, value) => {
    setUpdatedDecision((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save updated decision to the backend
  const saveDecision = async () => {
    try {
      const response = await fetch(`http://localhost:5001/decisions/${updatedDecision.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(updatedDecision),
      });

      if (!response.ok) {
        throw new Error('Failed to update decision');
      }

      const updatedData = await response.json();
      console.log(`Decision updated for ID ${updatedDecision.id}:`, updatedData);

      // Refresh decisions after update
      fetchDecisions();
      closeDialog();
    } catch (error) {
      console.error('Failed to update decision:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Decision
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Decision</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {decisions.map((decision) => (
              <TableRow key={decision.id}>
                <TableCell>{decision.project.title}</TableCell>
                <TableCell
                  style={{
                    color:
                      decision.decision === 'GO'
                        ? 'green'
                        : decision.decision === 'NO_GO'
                        ? 'red'
                        : decision.decision === 'GO_AVEC_RESERVE'
                        ? 'orange'
                        : 'black', // Default color
                    fontWeight: 'bold', // Optional: Make the text bold
                  }}
                >
                  {decision.decision}
                </TableCell>
                <TableCell>{decision.comments || 'N/A'}</TableCell>
                <TableCell>{decision.action || 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => openDialog(decision)}
                  >
                    Edit
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => sumDecisions(decision)}
                    endIcon={<span>&#9662;</span>} // Downward arrow
                  >
                    More
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Editing Decision */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Decision</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle1">Project: {updatedDecision?.project.title}</Typography>
          </Box>
          <Select
            value={updatedDecision?.decision || ''}
            onChange={(e) => handleFieldChange('decision', e.target.value)}
            displayEmpty
            fullWidth
            style={{
              backgroundColor:
                updatedDecision?.decision === 'GO'
                  ? 'lightgreen'
                  : updatedDecision?.decision === 'NO_GO'
                  ? 'lightcoral'
                  : updatedDecision?.decision === 'GO_AVEC_RESERVE'
                  ? 'lightyellow'
                  : 'white',
            }}
          >
            <MenuItem value="" disabled>
              Select Decision
            </MenuItem>
            <MenuItem value="GO">GO</MenuItem>
            <MenuItem value="NO_GO">NO_GO</MenuItem>
            <MenuItem value="GO_AVEC_RESERVE">GO_AVEC_RESERVE</MenuItem>
          </Select>
          <TextField
            label="Comments"
            value={updatedDecision?.comments || ''}
            onChange={(e) => handleFieldChange('comments', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Action"
            value={updatedDecision?.action || ''}
            onChange={(e) => handleFieldChange('action', e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={saveDecision} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={stepperOpen} onClose={closeStepper} fullWidth maxWidth="sm">
        <DialogTitle>Compte Rendu</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box mt={4}>
            {activeStep === 0 && (<Box sx={{ 
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center', 
              }}>
              <Box mb={2}>
                <Typography variant="body1">Project: {selectedProject?.title}</Typography>
                <Typography variant="body1">Prescripteur: {selectedProject?.createdBy}</Typography>
                <Typography variant="body1">Jallon: {selectedProject?.jalonTTM}</Typography>
                <Typography variant="body1">Mode de Traitement: {selectedProject?.modeTraitement}</Typography>
              </Box>
              <Box mr={3}>
                <Typography variant="body1">Type: {selectedProject?.type}</Typography>
                <Typography variant="body1">Direction: {selectedProject?.direction}</Typography>
                <Typography variant="body1">Description: {selectedProject?.description}</Typography>
              </Box>
            </Box>)}
            {activeStep === 1 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Direction</TableCell>
                      <TableCell>Present</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedProject?.guests?.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell>{guest.email}</TableCell>
                        <TableCell>{guest.direction}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={guest.isPresent || false}
                            onChange={(e) => {
                              guest.isPresent = e.target.checked;
                              setSelectedProject({ ...selectedProject }); // Update the state
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {activeStep === 2 && (
  <Box>
    <Typography variant="h6" gutterBottom>
      Update Decision
    </Typography>
    <Select
      value={selectedProject?.decision || ''}
      onChange={(e) => setSelectedProject({ ...selectedProject, decision: e.target.value })}
      displayEmpty
      fullWidth
      style={{
        backgroundColor:
          selectedProject?.decision === 'GO'
            ? 'lightgreen'
            : selectedProject?.decision === 'NO_GO'
            ? 'lightcoral'
            : selectedProject?.decision === 'GO_AVEC_RESERVE'
            ? 'lightyellow'
            : 'white',
      }}
    >
      <MenuItem value="" disabled>
        Select Decision
      </MenuItem>
      <MenuItem value="GO">GO</MenuItem>
      <MenuItem value="NO_GO">NO_GO</MenuItem>
      <MenuItem value="GO_AVEC_RESERVE">GO_AVEC_RESERVE</MenuItem>
    </Select>
    <TextField
      label="Comments"
      value={selectedProject?.comments || ''}
      onChange={(e) => setSelectedProject({ ...selectedProject, comments: e.target.value })}
      fullWidth
      margin="normal"
    />
    <TextField
      label="Action"
      value={selectedProject?.action || ''}
      onChange={(e) => setSelectedProject({ ...selectedProject, action: e.target.value })}
      fullWidth
      margin="normal"
    />
    <Button
      variant="contained"
      color="primary"
      onClick={async () => {
        try {
          const response = await fetch(`http://localhost:5001/decisions/${selectedProject.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token,
            },
            body: JSON.stringify({
              decision: selectedProject.decision,
              comments: selectedProject.comments,
              action: selectedProject.action,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update decision');
          }

          const updatedData = await response.json();
          console.log(`Decision updated for ID ${selectedProject.id}:`, updatedData);

          // Refresh decisions after update
          fetchDecisions();
          closeStepper();
        } catch (error) {
          console.error('Failed to update decision:', error);
        }
      }}
      sx={{ mt: 2 }}
    >
      Save Decision
    </Button>
  </Box>
)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBack} disabled={activeStep === 0}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={activeStep === steps.length - 1}>
            Next
          </Button>
          <Button onClick={closeStepper} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DecisionTable;