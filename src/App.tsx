import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { LandingPage } from '@/components/landing/LandingPage'
import SignInPage from '@/pages/SignInPage'
import SignUpPage from '@/pages/SignUpPage'
import DashboardPage from '@/pages/DashboardPage'
import Members from '@/pages/Members.jsx'
import MemberDetails from '@/pages/MemberDetails.jsx'
import RiskPage from '@/pages/RiskPage'
import AuctionPage from '@/pages/AuctionPage'
<<<<<<< Updated upstream
import AssistantPage from '@/pages/AssistantPage'
=======
>>>>>>> Stashed changes
import GroupControlsPage from '@/pages/GroupControlsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/:id" element={<MemberDetails />} />
        <Route path="/risk" element={<RiskPage />} />
        <Route path="/auction" element={<AuctionPage />} />
        <Route path="/ledger" element={<AuctionPage />} />
<<<<<<< Updated upstream
        <Route path="/assistant" element={<AssistantPage />} />
=======
>>>>>>> Stashed changes
        <Route path="/settings" element={<GroupControlsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
