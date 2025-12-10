// LINE AI God Mode 設計系統定義
// 此檔案定義應用程式的完整視覺設計規範

export const DesignTokens = {
  // 色彩系統
  colors: {
    // 主色系（金黃仙氣主題）
    primary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',  // 主要使用
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // 輔助色系（桃花粉）
    accent: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',  // 主要使用
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    
    // 中性色系
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    
    // 語意色系
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // 角色專屬色系
    persona: {
      consultant: '#7c3aed',  // 紫色 - 智慧
      friend: '#ec4899',      // 粉色 - 親切
      concise: '#f97316',     // 橙色 - 活力
      creative: '#06b6d4',    // 青色 - 創意
      tech: '#3b82f6',        // 藍色 - 科技
    }
  },
  
  // 間距系統（基於 4px）
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  // 圓角系統
  borderRadius: {
    none: '0',
    sm: '0.375rem',    // 6px
    base: '0.5rem',    // 8px
    md: '0.75rem',     // 12px
    lg: '1rem',        // 16px
    xl: '1.5rem',      // 24px
    '2xl': '2rem',     // 32px
    full: '9999px',
  },
  
  // 陰影系統
  shadows: {
    soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
    card: '0 4px 12px rgba(0, 0, 0, 0.1)',
    elevated: '0 8px 24px rgba(0, 0, 0, 0.12)',
    float: '0 12px 32px rgba(0, 0, 0, 0.15)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  },
  
  // 動畫系統
  animation: {
    duration: {
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }
  },
  
  // 字體系統
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'Menlo, Monaco, "Courier New", monospace',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],       // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },
  
  // Z-index 層級系統
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
  
  // 斷點系統（響應式設計）
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
};

// 設計模式 - 常用元件樣式
export const ComponentPatterns = {
  // 按鈕樣式
  button: {
    primary: `
      px-6 py-2.5 text-sm font-bold text-white 
      bg-gradient-to-r from-yellow-400 to-yellow-500 
      hover:from-yellow-500 hover:to-yellow-600
      rounded-xl shadow-soft 
      transition-all duration-250 
      active:scale-95
    `,
    secondary: `
      px-5 py-2.5 text-sm font-medium text-gray-700 
      bg-white hover:bg-gray-50 
      border border-gray-200 
      rounded-xl 
      transition-colors duration-250
    `,
    ghost: `
      px-4 py-2 text-sm font-medium text-gray-600 
      hover:bg-gray-100 
      rounded-lg 
      transition-colors duration-250
    `
  },
  
  // 卡片樣式
  card: {
    base: `
      bg-white 
      rounded-2xl 
      shadow-card 
      border border-gray-100 
      overflow-hidden
    `,
    interactive: `
      bg-white 
      rounded-2xl 
      shadow-soft 
      hover:shadow-card 
      border border-gray-100 
      transition-all duration-250 
      cursor-pointer
      active:scale-98
    `
  },
  
  // 輸入框樣式
  input: {
    base: `
      w-full px-4 py-3 
      border border-gray-200 
      rounded-xl 
      bg-white 
      text-sm 
      focus:outline-none 
      focus:border-yellow-400 
      focus:ring-2 
      focus:ring-yellow-100 
      transition-all duration-250
    `
  },
  
  // 模態視窗樣式
  modal: {
    backdrop: `
      fixed inset-0 
      bg-black/60 
      backdrop-blur-sm 
      z-modalBackdrop
    `,
    container: `
      bg-white 
      rounded-3xl 
      shadow-float 
      overflow-hidden 
      z-modal
    `
  }
};

export default DesignTokens;
