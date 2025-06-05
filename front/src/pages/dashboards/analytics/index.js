// ** MUI Imports
import Grid from '@mui/material/Grid'
import React, { useEffect, useState } from 'react'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Component Import
import CardStatisticsVertical from 'src/@core/components/card-statistics/card-stats-vertical'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports
import AnalyticsSessions from 'src/views/dashboards/analytics/AnalyticsSessions'
import AnalyticsOverview from 'src/views/dashboards/analytics/AnalyticsOverview'
import AnalyticsPerformance from 'src/views/dashboards/analytics/AnalyticsPerformance'
import AnalyticsWeeklySales from 'src/views/dashboards/analytics/AnalyticsWeeklySales'
import AnalyticsVisitsByDay from 'src/views/dashboards/analytics/AnalyticsVisitsByDay'
import AnalyticsTotalRevenue from 'src/views/dashboards/analytics/AnalyticsTotalRevenue'
import AnalyticsSalesCountry from 'src/views/dashboards/analytics/AnalyticsSalesCountry'
import AnalyticsCongratulations from 'src/views/dashboards/analytics/AnalyticsCongratulations'
import AnalyticsActivityTimeline from 'src/views/dashboards/analytics/AnalyticsActivityTimeline'
import AnalyticsTotalTransactions from 'src/views/dashboards/analytics/AnalyticsTotalTransactions'
import AnalyticsProjectStatistics from 'src/views/dashboards/analytics/AnalyticsProjectStatistics'
import AnalyticsTopReferralSources from 'src/views/dashboards/analytics/AnalyticsTopReferralSources'
import ApexBarChart from 'src/views/charts/apex-charts/ApexBarChart'
import ApexLineChart from 'src/views/charts/apex-charts/ApexLineChart'
import authConfig from 'src/configs/auth';
import API_URL from 'src/configs/api';

const AnalyticsDashboard = () => {
  const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
  const [dashboardData, setDashboardData] = useState({
    totalProjects: 0,
    projectCreationRate: '0',
    validatedProjects: 0,
    validatedProjectsRate: '0',
    underValidationProjects: 0,
    underValidationProjectsRate: '0',
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard`, {
          headers: {
            Authorization: token, // Adjust based on your auth setup
          },
        })
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <ApexChartWrapper>
      <Grid container spacing={6} className='match-height'>
        
        <Grid item xs={6} md={4}>
          <CardStatisticsVertical
            stats={dashboardData.totalProjects}
            color='success'
            trendNumber={`${dashboardData.projectCreationRate}%`}
            title='Mes Dossiers'
            chipText='Last 2 Months'
            icon={<Icon icon='mdi:note-text' />}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <CardStatisticsVertical
            stats={dashboardData.validatedProjects}
            color='primary'
            trendNumber={`${dashboardData.validatedProjectsRate}%`}
            title='Dossiers validés'
            chipText='Last 2 Months'
            icon={<Icon icon='mdi:folder' />}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <CardStatisticsVertical
            stats={dashboardData.underValidationProjects}
            color='warning'
            trendNumber={`${dashboardData.underValidationProjectsRate}%`}
            title='En cours de traitement'
            chipText='Last 2 Months'
            icon={<Icon icon='mdi:note-text' />}
          />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <AnalyticsTotalTransactions />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticsPerformance />
        </Grid>
        
       {/*Grid item xs={12} md={4}>
          <ApexBarChart />   
        </Grid>*/}
        <Grid item xs={12} md={8}>
          <ApexLineChart />
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

export default AnalyticsDashboard
