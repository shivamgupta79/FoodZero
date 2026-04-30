// Theme Configuration for Food Donation Platform

export const theme = {
  colors: {
    primary: {
      50: '#FFF3E0',
      100: '#FFE0B2',
      500: '#FF6B35',
      600: '#F7931E',
      700: '#E65100'
    },
    secondary: {
      50: '#E8F5E9',
      100: '#C8E6C9',
      500: '#4CAF50',
      600: '#2E7D32',
      700: '#1B5E20'
    },
    accent: {
      500: '#FFC107',
      600: '#FFD54F'
    },
    status: {
      pending: '#FFEB3B',
      accepted: '#4CAF50',
      delivered: '#42A5F5',
      cancelled: '#EF5350',
      rejected: '#EF5350'
    }
  },
  spacing: {
    card: '1.5rem', // 24px
    section: '3rem', // 48px
    page: '2rem' // 32px
  },
  borderRadius: {
    card: '0.75rem', // 12px
    button: '0.5rem', // 8px
    input: '0.5rem' // 8px
  },
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    cardHover: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    button: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }
};

// Tailwind class mappings for easy use
export const tailwindTheme = {
  colors: {
    primary: 'orange-500',
    primaryLight: 'orange-100',
    primaryDark: 'orange-600',
    secondary: 'green-500',
    secondaryLight: 'green-100',
    secondaryDark: 'green-600',
    accent: 'yellow-500',
    accentLight: 'yellow-100'
  },
  gradients: {
    primary: 'from-orange-500 to-orange-600',
    secondary: 'from-green-500 to-green-600',
    accent: 'from-yellow-400 to-yellow-500'
  }
};
