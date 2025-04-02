import React, { Component, createRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const formData = [
  {
    type: 'header',
    subtype: 'h1',
    label: 'Création de formulaire gouvernance'
  },
  {
    type: 'paragraph',
    label: 'This is a demonstration of formBuilder running in a React project.'
  }
];

class FormBuilder extends Component {
  fb = createRef();

  async componentDidMount() {
    // Ensure we're in the browser environment
    if (typeof window !== 'undefined') {
      // Dynamically import jQuery
      const $ = (await import('jquery')).default;
      window.jQuery = $;
      window.$ = $;

      // Dynamically import the jQuery plugins
      await import('jquery-ui-sortable');
      await import('formBuilder');

      // Initialize formBuilder on the referenced element
      $(this.fb.current).formBuilder({ formData });
    } else {
      console.error('jQuery is not available.');
    }
  }

  render() {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Creation d'une nouvelle gouvernance
          </Typography>
          <div id='fb-editor' ref={this.fb} style={{ color: 'black' }} />
        </CardContent>
      </Card>
    );
  }
}

export default FormBuilder;
