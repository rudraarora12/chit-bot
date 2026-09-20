import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { LandingPage } from '@/components/landing/LandingPage'
import SignInPage from '@/pages/SignInPage'
import SignUpPage from '@/pages/SignUpPage'
import DashboardPage from '@/pages/DashboardPage'
import Members from '@/pages/Members.jsx'
import MemberDetails from '@/pages/MemberDetails.jsx'
import RiskPage from '@/pages/RiskPage'
import AuctionPage from '@/pages/AuctionPage'
import GroupControlsPage from '@/pages/GroupControlsPage'
import MemberDashboard from '@/pages/MemberDashboard.jsx'
import CreateCommitteePage from '@/pages/CreateCommitteePage.jsx'
import CommitteeDetailsPage from '@/pages/CommitteeDetailsPage.jsx'
import SubscriptionPage from '@/pages/SubscriptionPage.jsx'
import LiveAuctionRoomPage from '@/pages/LiveAuctionRoomPage.jsx'

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
        <Route path="/auction" element={<LiveAuctionRoomPage />} />
        <Route path="/ledger" element={<LiveAuctionRoomPage />} />
        <Route path="/settings" element={<GroupControlsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />

        {/* Chit Committee Discovery & Admin Routes */}
        <Route path="/committees" element={<Members />} />
        <Route path="/committees/create" element={<CreateCommitteePage />} />
        <Route path="/committees/:id" element={<CommitteeDetailsPage />} />
        <Route path="/committees/:id/auction" element={<LiveAuctionRoomPage />} />

        {/* Member Portal Routes */}
        <Route path="/member/dashboard" element={<MemberDashboard />} />
        <Route path="/member/contributions" element={<MemberDashboard />} />
        <Route path="/member/auction" element={<LiveAuctionRoomPage />} />
        <Route path="/member/benefits" element={<MemberDashboard />} />
        <Route path="/member/transparency" element={<MemberDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
