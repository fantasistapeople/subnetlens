import { useState, useCallback } from 'react'
import Nav from './components/Nav'
import Calculator from './components/Calculator'
import SubnetSplitter from './components/SubnetSplitter'
import RangeConverter from './components/RangeConverter'
import OverlapChecker from './components/OverlapChecker'
import CidrCheatSheet from './components/CidrCheatSheet'
import CopyToast from './components/CopyToast'
import Footer from './components/Footer'

const AUTHOR_NAME   = 'Jeremy David Alexander'
const PORTFOLIO_URL = 'https://portfolio-silk-ten-eop8cqxs8y.vercel.app/'

export default function App() {
  const [activeTab,    setActiveTab]    = useState('calculator')
  const [toastVisible, setToastVisible] = useState(false)

  const handleCopy = useCallback(async (val) => {
    try {
      await navigator.clipboard.writeText(val)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 1500)
    } catch {
    }
  }, [])

  return (
    <>
      <Nav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="main-container">
        {activeTab === 'calculator' && <Calculator onCopy={handleCopy} />}
        {activeTab === 'splitter'   && <SubnetSplitter />}
        {activeTab === 'range'      && <RangeConverter />}
        {activeTab === 'overlap'    && <OverlapChecker />}
        {activeTab === 'cheatsheet' && <CidrCheatSheet />}
      </main>

      <CopyToast visible={toastVisible} />
      <Footer name={AUTHOR_NAME} portfolioUrl={PORTFOLIO_URL} />
    </>
  )
}
