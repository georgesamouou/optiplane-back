import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Button, Box, Card, CardContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SettingsPage = () => {
  const [priorites, setPriorites] = useState([]);
  const [newPriorite, setNewPriorite] = useState('');
  const [newObjectif, setNewObjectif] = useState('');
  const [newKpi, setNewKpi] = useState('');

  const addPriorite = () => {
    setPriorites([...priorites, { name: newPriorite, objectifs: [] }]);
    setNewPriorite('');
  };

  const addObjectif = (prioriteIndex) => {
    const updatedPriorites = [...priorites];
    updatedPriorites[prioriteIndex].objectifs.push({ name: newObjectif, kpis: [] });
    setPriorites(updatedPriorites);
    setNewObjectif('');
  };

  const addKpi = (prioriteIndex, objectifIndex) => {
    const updatedPriorites = [...priorites];
    updatedPriorites[prioriteIndex].objectifs[objectifIndex].kpis.push(newKpi);
    setPriorites(updatedPriorites);
    setNewKpi('');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings Page
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 4 }}>
            <TextField
              label="New Priorité Stratégique"
              value={newPriorite}
              onChange={(e) => setNewPriorite(e.target.value)}
              sx={{ mr: 2 }}
            />
            <Button variant="contained" color="primary" onClick={addPriorite}>
              Add Priorité
            </Button>
          </Box>
          {priorites.map((priorite, prioriteIndex) => (
            <Accordion key={prioriteIndex}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{priorite.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    label="New Objectif"
                    value={newObjectif}
                    onChange={(e) => setNewObjectif(e.target.value)}
                    sx={{ mr: 2 }}
                  />
                  <Button variant="contained" color="secondary" onClick={() => addObjectif(prioriteIndex)}>
                    Add Objectif
                  </Button>
                </Box>
                {priorite.objectifs.map((objectif, objectifIndex) => (
                  <Accordion key={objectifIndex} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{objectif.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <TextField
                          label="New KPI"
                          value={newKpi}
                          onChange={(e) => setNewKpi(e.target.value)}
                          sx={{ mr: 2 }}
                        />
                        <Button variant="contained" color="secondary" onClick={() => addKpi(prioriteIndex, objectifIndex)}>
                          Add KPI
                        </Button>
                      </Box>
                      <Box>
                        {objectif.kpis.map((kpi, kpiIndex) => (
                          <Typography key={kpiIndex} sx={{ mb: 1 }}>
                            {kpi}
                          </Typography>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
