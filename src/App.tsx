import { useEffect } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { useKeepAlive } from './hooks/useKeepAlive'
import { useAppStore } from './state/store'

function App() {
  const { checkConnection } = useAppStore();

  // Ping keep-alive berkala (5 menit + saat tab kembali terlihat) agar backend
  // scale-to-zero tidak tidur selama aplikasi terbuka.
  useKeepAlive();

  // Pemeriksaan koneksi awal — memakai retry sadar cold start, jadi request
  // pertama setelah idle tidak diputus sepihak oleh timeout pendek.
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <MainLayout />
  )
}

export default App
