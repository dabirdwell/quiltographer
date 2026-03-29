"use client";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 py-16">
      <div className="max-w-2xl mx-auto prose prose-stone">
        <h1 className="font-serif">Terms of Service</h1>
        <p className="text-sm text-stone-500">Effective: March 29, 2026 · Humanity and AI LLC</p>
        <h2>The Service</h2>
        <p>Quiltographer is a quilting pattern reader that uses AI to parse, clarify, and calculate fabric requirements for quilt patterns. Free users get basic pattern viewing. Pro subscribers get unlimited AI clarifications, fabric calculations, and difficulty ratings.</p>
        <h2>Subscriptions</h2>
        <p>Pro subscriptions are billed monthly via Stripe. Cancel anytime from your account settings or the Stripe customer portal. Cancellation takes effect at the end of your current billing period. No refunds for partial months.</p>
        <h2>Your Content</h2>
        <p>You retain all rights to patterns you upload. We process them only to provide the service and do not store them after your session. We do not claim ownership of your quilting patterns or designs.</p>
        <h2>AI Limitations</h2>
        <p>Our AI parser does its best but is not perfect. Always verify fabric calculations before cutting. We are not responsible for material waste from parser errors. When in doubt, add 10% to fabric estimates.</p>
        <h2>Acceptable Use</h2>
        <p>Do not upload copyrighted patterns you do not own or have license to use. Do not attempt to reverse-engineer the AI parsing system. Standard use only.</p>
        <h2>Contact</h2>
        <p>Questions? david@humanityandai.com · Humanity and AI LLC · Oklahoma City, OK</p>
      </div>
    </main>
  );
}
