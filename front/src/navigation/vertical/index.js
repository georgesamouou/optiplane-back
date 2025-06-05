const navigation = () => {
  return [
    {
      title: 'Dashboards',
      icon: 'mdi:home-outline',
      badgeContent: 'new',
      badgeColor: 'error',
      children: [
        {
          title: 'Analytics',
          path: '/dashboards/analytics'
        }
      ]
    },
    {
      sectionTitle: 'Apps & Pages'
    },

    {
      title: 'Calendar',
      icon: 'mdi:calendar-blank-outline',
      path: '/apps/calendar'
    },
    {
      title: 'Session',
      icon: 'mdi:shield-outline',
      path: '/session'
    },
    {
      title: 'Planification',
      icon: 'mdi:apps',
      path: '/planification'
    },
    {
      title: 'Decision',
      icon: 'mdi:palette-swatch-outline',
      path: '/decision'
    },
    {
      title: 'Projects',
      icon: 'mdi:clipboard-outline',
      badgeContent: 'new',
      badgeColor: 'error',
      children: [
        {
          title: 'List',
          path: '/projet'
        }
        
        ,/*
        {
          title: 'Settings',
          path: '/settings'
        }*/
      ]
    },
    {
      title: 'Email',
      icon: 'mdi:email-outline',
      path: '/apps/email'
    },
    
/*
    {
      title: 'Gouvernance',
      icon: 'mdi:calendar-blank-outline',
      path: '/gouvernace'
    },*/

/*
    {
      title: 'User',
      icon: 'mdi:account-outline',
      children: [
        {
          title: 'List',
          path: '/apps/user/list'
        },

      ]
    },
    {
      title: 'Roles & Permissions',
      icon: 'mdi:shield-outline',
      children: [
        {
          title: 'Roles',
          path: '/apps/roles'
        },
      ]
    },*/
  ]
}

export default navigation

