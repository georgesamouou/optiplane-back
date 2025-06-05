import React, { useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports
import OptionsMenu from 'src/@core/components/option-menu'
import authConfig from 'src/configs/auth';
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import API_URL from 'src/configs/api';

const AnalyticsPerformance = () => {
  const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
  const [series, setSeries] = useState([
    { name: 'COMOP', data: [] },
    { name: 'CI', data: [] }
  ])

  // ** Hook
  const theme = useTheme()

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(`${API_URL}/projects-by-type`, {
          headers: {
            Authorization: token // Adjust based on your auth setup
          }
        })
        const data = await response.json()
        setSeries(data)
        console.log('Project data by type:', data)
      } catch (error) {
        console.error('Failed to fetch project data by type:', error)
      }
    }

    fetchProjectData()
  }, [])

  const options = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    legend: {
      markers: { offsetX: -2 },
      itemMargin: { horizontal: 10 },
      labels: { colors: theme.palette.text.secondary }
    },
    plotOptions: {
      radar: {
        size: 100,
        polygons: {
          strokeColors: theme.palette.divider,
          connectorColors: theme.palette.divider
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: [theme.palette.warning.main, theme.palette.primary.main],
        shadeIntensity: 1,
        type: 'vertical',
        opacityFrom: 1,
        opacityTo: 0.9,
        stops: [0, 100]
      }
    },
    colors: [theme.palette.warning.main, theme.palette.primary.main],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    markers: { size: 0 },
    xaxis: {
      labels: {
        show: true,
        style: {
          fontSize: '14px',
          colors: [
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled
          ]
        }
      }
    },
    yaxis: { show: false },
    grid: { show: false }
  }

  return (
    <Card>
      <CardHeader
        title='Statistiques des dossiers'
        action={
          <OptionsMenu
            options={['Last 28 Days', 'Last Month', 'Last Year']}
            iconButtonProps={{ size: 'small', className: 'card-more-options' }}
          />
        }
      />
      <CardContent
        sx={{
          pt: { xs: `${theme.spacing(6)} !important`, md: `${theme.spacing(0)} !important` },
          pb: { xs: `${theme.spacing(8)} !important`, md: `${theme.spacing(5)} !important` }
        }}
      >
        <ReactApexcharts type='radar' height={278} series={series} options={options} />
      </CardContent>
    </Card>
  )
}

export default AnalyticsPerformance
