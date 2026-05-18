import { createContext, useContext } from 'react'

// Create context with default values
const LayoutContext = createContext({
  mainMenu: [],
  mainMenuBtn: [],
  topMenu: [],
  bottomMenu: [],
  footer: {},
  globalTags: {},
  mobileLayout: {},
  mobileTopMenu: [],
  mobileMainMenu: []
})

// Hook to use the layout context
export const useLayout = () => {
  const context = useContext(LayoutContext)
  
  if (!context) {
    console.warn('useLayout must be used within LayoutProvider')
    return {
      mainMenu: [],
      mainMenuBtn: [],
      mobileMainMenu: [],
      topMenu: [],
      mobileTopMenu: [],
      bottomMenu: [],
      footer: {},
      globalTags: {},
      mobileLayout: {}
    }
  }
  
  return context
}

// Provider component
export const LayoutProvider = ({ children, layoutData }) => {
  return (
    <LayoutContext.Provider value={layoutData}>
      {children}
    </LayoutContext.Provider>
  )
}