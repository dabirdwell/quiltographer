"use client";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 py-16">
      <div className="max-w-2xl mx-auto prose prose-stone">
        <h1 className="font-serif">Privacy Policy</h1>
        <p className="text-sm text-stone-500">Effective: March 29, 2026 · Humanity and AI LLC</p>
        <h2>What We Collect</h2>
        <p>When you create an account, we collect your email address and authentication data via Supabase. When you subscribe, Stripe processes your payment — we never see or store your full card number.</p>
        <p>When you upload quilt patterns, the files are processed by our AI parser to extract instructions. <strong>We do not store your uploaded patterns permanently.</strong></p>
        <h2>How We Use Your Data</h2>
        <p>Your email: account access and occasional product updates. Your pattern data: only to generate parsed instructions during your session. Your subscription status: to manage Pro feature access.</p>
        <h2>Third-Party Services</h2>
        <p>Supabase (authentication), Stripe (payments), Anthropic (AI pattern clarification — no personal data sent), Vercel (hosting).</p>
        <h2>Your Rights</h2>
        <p>Delete your account anytime by emailing david@humanityandai.com. All data removed within 30 days.</p>
        <h2>Contact</h2>
        <p>Humanity and AI LLC · Oklahoma City, OK · david@humanityandai.com</p>
      </div>
    </main>
  );
}
