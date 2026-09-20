import { Hero } from '@/components/landing/Hero'
import { Navbar } from '@/components/landing/Navbar'
import { StatsStrip } from '@/components/landing/StatsStrip'
import { TrustStrip } from '@/components/landing/TrustStrip'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { SolutionLifecycleSection } from '@/components/landing/SolutionLifecycleSection'
import { ProductFeatures } from '@/components/landing/ProductFeatures'
import { WhyOrganizersPaySection } from '@/components/landing/WhyOrganizersPaySection'
import { MemberExperienceSection } from '@/components/landing/MemberExperienceSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { PricingSection } from '@/components/landing/PricingSection'
import { PlanComparisonSection } from '@/components/landing/PlanComparisonSection'
import { AiRiskSection } from '@/components/landing/AiRiskSection'
import { TrustImpactSection } from '@/components/landing/TrustImpactSection'
import { FinalCtaSection } from '@/components/landing/FinalCtaSection'
import { Footer } from '@/components/landing/Footer'

export function LandingPage() {
  return (
    <div id="top" className="min-h-svh bg-background">
      <Navbar />
      <main>
        {/* Section 1: Hero Section */}
        <Hero />

        {/* Supporting Metrics & Value Strip */}
        <StatsStrip />
        <TrustStrip />

        {/* Section 2: Problem Section */}
        <ProblemSection />

        {/* Section 3: Lifecycle Solution Flow */}
        <SolutionLifecycleSection />

        {/* Section 4: Organizer Paid Features (8 Features) */}
        <ProductFeatures />

        {/* Section 5: Why Organizers Pay (Comparison) */}
        <WhyOrganizersPaySection />

        {/* Section 6: Member Experience (Free for Members) */}
        <MemberExperienceSection />

        {/* Section 7: How It Works (5-Step Flow for Organizers) */}
        <HowItWorks />

        {/* Section 8: Organizer Plan (Dedicated Pricing Card) */}
        <PricingSection />

        {/* Section 9: Free Member vs Organizer Matrix */}
        <PlanComparisonSection />

        {/* Section 10: AI + Real-Time Live Data Differentiator */}
        <AiRiskSection />

        {/* Section 11: Transparency Pillars */}
        <TrustImpactSection />

        {/* Section 12: Final Call to Action */}
        <FinalCtaSection />
      </main>

      {/* Extended Footer */}
      <Footer />
    </div>
  )
}
