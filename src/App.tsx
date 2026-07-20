import { useEffect } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { useAppStore } from './state/store'

function App() {
  const { checkConnection } = useAppStore();

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <MainLayout />
  )
}

export default App
