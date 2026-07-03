tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ["Inter", "sans-serif"],
            serif: ["Playfair Display", "serif"],
          },
          colors: {
            stone: {
              50: '#fafafa',
              100: '#f5f5f5',
              200: '#e5e5e5',
              300: '#d4d4d4',
              400: '#a3a3a3',
              500: '#737373',
              600: '#525252',
              700: '#404040',
              800: '#262626',
              900: '#111111',
              950: '#000000',
            }
          },
          animation: {
            marquee: 'marquee 40s linear infinite',
          },
          keyframes: {
            marquee: {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(-50%)' },
            }
          }
        }
      }
    }

