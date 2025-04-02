import React, { useState } from 'react';
import {
  TextField,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Typography,
} from '@mui/material';

// Example JSON form definition
const jsonForm = [
  {
    "type": "header",
    "subtype": "h3",
    "label": "Header",
    "access": false
  },
  {
    "type": "checkbox-group",
    "required": false,
    "label": "Checkbox Group",
    "toggle": false,
    "inline": false,
    "name": "checkbox-group-1739798803649-0",
    "access": false,
    "other": false,
    "values": [
      {
        "label": "Option 1",
        "value": "option-1",
        "selected": true
      }
    ]
  },
  {
    "type": "date",
    "required": false,
    "label": "Date Field",
    "className": "form-control",
    "name": "date-1739798805082-0",
    "access": false,
    "subtype": "date"
  },
  {
    "type": "file",
    "required": false,
    "label": "File Upload",
    "className": "form-control",
    "name": "file-1739798806447-0",
    "access": false,
    "multiple": false
  },
  {
    "type": "hidden",
    "name": "hidden-1739798812214-0",
    "access": false
  },
  {
    "type": "number",
    "required": false,
    "label": "Number",
    "className": "form-control",
    "name": "number-1739798814548-0",
    "access": false,
    "subtype": "number"
  },
  {
    "type": "paragraph",
    "subtype": "p",
    "label": "Paragraph",
    "access": false
  },
  {
    "type": "radio-group",
    "required": false,
    "label": "Radio Group",
    "inline": false,
    "name": "radio-group-1739798819031-0",
    "access": false,
    "other": false,
    "values": [
      {
        "label": "Option 1",
        "value": "option-1",
        "selected": false
      },
      {
        "label": "Option 2",
        "value": "option-2",
        "selected": false
      },
      {
        "label": "Option 3",
        "value": "option-3",
        "selected": false
      }
    ]
  },
  {
    "type": "select",
    "required": false,
    "label": "Select",
    "className": "form-control",
    "name": "select-1739798822014-0",
    "access": false,
    "multiple": false,
    "values": [
      {
        "label": "Option 1",
        "value": "option-1",
        "name": "option-1",
      },
      {
        "label": "Option 2",
        "value": "option-2",
        "name": "option-2",

      },
      {
        "label": "Option 3",
        "value": "option-3",
        "name": "option-3",
      }
    ]
  },
  {
    "type": "text",
    "required": false,
    "label": "Text Field",
    "className": "form-control",
    "name": "text-1739798825282-0",
    "access": false,
    "subtype": "text"
  },
  {
    "type": "textarea",
    "required": false,
    "label": "Text Area",
    "className": "form-control",
    "name": "textarea-1739798827147-0",
    "access": false,
    "subtype": "textarea"
  },
  {
    "type": "button",
    "label": "Button",
    "subtype": "button",
    "className": "btn-default btn",
    "name": "button-1739798835581-0",
    "access": false,
    "style": "default"
  }
];

const MuiFormGenerator = ({ formJson = jsonForm }) => {
  const [formState, setFormState] = useState({});

  const handleChange = (name, value) => {
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // A helper function that returns the corresponding MUI component for each field type
  const renderField = (field, index) => {
    switch (field.type) {
      case 'header': {
        // Use Typography for headers
        const variant =
          field.subtype === 'h1'
            ? 'h1'
            : field.subtype === 'h2'
            ? 'h2'
            : 'h3';

        return (
          <Typography key={index} variant={'h5'}>
            {field.label}
          </Typography>
        );
      }
      case 'paragraph': {
        return (
          <Typography key={index} variant="body1">
            {field.label}
          </Typography>
        );
      }
      case 'text':
        return (
          <TextField
            key={index}
            label={field.label}
            name={field.name}
            fullWidth
            margin="normal"
          />
        );
      case 'number':
        return (
          <TextField
            key={index}
            label={field.label}
            name={field.name}
            type="number"
            fullWidth
            margin="normal"
          />
        );
      case 'date':
        return (
          <TextField
            key={index}
            label={field.label}
            name={field.name}
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
          />
        );
      case 'textarea': {
        return (
          <TextField
            key={index}
            label={field.label}
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={formState[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
      }
      case 'checkbox-group':
        return (
          <FormControl key={index} component="fieldset" margin="normal">
            <Typography variant="subtitle1" gutterBottom>
              {field.label}
            </Typography>
            <FormGroup row={!field.inline}>
              {field.values.map((option, i) => (
                <FormControlLabel
                  key={i}
                  control={
                    <Checkbox
                      name={field.name}
                      defaultChecked={option.selected}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        );
      case 'radio-group':
        return (
          <FormControl key={index} component="fieldset" margin="normal">
            <Typography variant="subtitle1" gutterBottom>
              {field.label}
            </Typography>
            <RadioGroup name={field.name} row={!field.inline}>
              {field.values.map((option, i) => (
                <FormControlLabel
                  key={i}
                  control={<Radio defaultChecked={option.selected} />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case 'select':
        return (
          <FormControl key={index} fullWidth margin="normal">
            <InputLabel>{field.label}</InputLabel>
            <Select
              name={field.name}
              defaultValue={
                (field.values.find((opt) => opt.selected) || {}).value || ''
              }
              label={field.label}
            >
              {field.values.map((option, i) => (
                <MenuItem key={i} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'file':
        return (
          <FormControl key={index} fullWidth margin="normal">
            <Button variant="contained" component="label">
              {field.label}
              <input
                type="file"
                name={field.name}
                hidden
                multiple={field.multiple || false}
              />
            </Button>
          </FormControl>
        );
      case 'hidden':
        return <input key={index} type="hidden" name={field.name} />;
      case 'button': {
        return (
          <Button
            key={index}
            variant="contained"
            className={field.className}
            onClick={() => console.log('Button clicked')}
          >
            {field.label}
          </Button>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div style={{ marginLeft: '10px', marginRight: '10px' }}>
      {formJson.map((field, index) => renderField(field, index))}
    </div>
  );
};

export default MuiFormGenerator;
