import React, { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import authConfig from 'src/configs/auth';
import API_URL from 'src/configs/api';
// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

const ApexLineChart = () => {
  const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
  const [series, setSeries] = useState([
    {
      data: [],
    },
  ])
  const [totalProjects, setTotalProjects] = useState(0);
  // ** Hook
  const theme = useTheme()

  useEffect(() => {
    const fetchProjectsByJalon = async () => {
      try {
        const response = await fetch(`${API_URL}/projects-by-jalon`, {
          headers: {
            Authorization: token,//ajust based on your auth setup
          },
        })
        const data = await response.json()
        setSeries([{ data }]) // Update the series with the fetched data
        const total = data.reduce((sum, count) => sum + count, 0);
        setTotalProjects(total);
      } catch (error) {
        console.error('Failed to fetch projects by jalonTTM:', error)
      }
    }

    fetchProjectsByJalon()
  }, [])

  const options = {
    chart: {
      parentHeightOffset: 0,
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    colors: ['#ff9f43'],
    stroke: { curve: 'straight' },
    dataLabels: { enabled: false },
    markers: {
      strokeWidth: 7,
      strokeOpacity: 1,
      colors: ['#ff9f43'],
      strokeColors: ['#fff'],
    },
    grid: {
      padding: { top: -10 },
      borderColor: theme.palette.divider,
      xaxis: {
        lines: { show: true },
      },
    },
    tooltip: {
      custom(data) {
        return `<div class='bar-chart'>
          <span>${data.series[data.seriesIndex][data.dataPointIndex]}%</span>
        </div>`
      },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.disabled },
      },
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { color: theme.palette.divider },
      crosshairs: {
        stroke: { color: theme.palette.divider },
      },
      labels: {
        style: { colors: theme.palette.text.disabled },
      },
      categories: ['T-1', 'T0', 'T1', 'T2', 'T3', 'T4'], // Jalon categories
    },
  }

  return (
    <Card>
      <CardHeader
        title='Projets par jalon'
        subheader='Project validation curve'
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          '& .MuiCardHeader-action': { mb: 0 },
          '& .MuiCardHeader-content': { mb: [2, 0] },
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant='h6' sx={{ mr: 5 }}>
              {totalProjects} Projets
            </Typography>
            
          </Box>
        }
      />
      <CardContent>
        <ReactApexcharts type='line' height={400} options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default ApexLineChart
