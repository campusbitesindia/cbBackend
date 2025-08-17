"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <main className="relative max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Close Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 right-4 p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
      </button>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
        Privacy Policy
      </h1>
      <p className="mb-4 text-sm text-gray-500 text-center">
        Effective Date: <span className="font-medium">01/08/2025</span>
      </p>

      {/* Entity Info */}
      <div className="bg-gray-50 p-4 rounded-md shadow-sm border mb-6 text-gray-700">
        <p>
          <strong>Entity Name:</strong> SMARTDESH TECHNOLOGIES LLP (“we,” “our,” “us”)
          <br />
          <strong>Brand Name:</strong> Campus Bites
          <br />
          <strong>Registered Office:</strong> 2nd Floor, B-X-142, Mochpura Bazar, Ludhiana Punjab, India
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <Section title="1. Information We Collect">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Personal Information:</strong> Name, email, phone, address, payment details, and account credentials.</li>
            <li><strong>Non-Personal Information:</strong> Device type, browser, IP address, and usage data.</li>
            <li><strong>Order Data:</strong> Items ordered, order history, and payment method.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc list-inside space-y-2">
            <li>Process orders and payments.</li>
            <li>Deliver food and provide customer support.</li>
            <li>Improve the Platform and personalize your experience.</li>
            <li>Send order updates, promotional offers, and notifications.</li>
            <li>Comply with legal and regulatory requirements.</li>
          </ul>
        </Section>

        <Section title="3. Sharing Your Information">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Vendors/Canteens:</strong> To process and deliver your orders.</li>
            <li><strong>Service Providers:</strong> Payment gateways, delivery partners, analytics providers.</li>
            <li><strong>Legal Authorities:</strong> When required by law or to protect rights, property, or safety.</li>
          </ul>
          <p className="mt-2">We do not sell or rent your personal information to third parties.</p>
        </Section>

        <Section title="4. Data Security">
          We implement reasonable technical and organizational measures to protect your data in compliance with Indian IT laws.
        </Section>

        <Section title="5. Cookies & Tracking">
          We use cookies and similar technologies to enhance your experience and analyze usage. You may disable cookies, but some features may not function properly.
        </Section>

        <Section title="6. Your Rights">
          <ul className="list-disc list-inside space-y-2">
            <li>Access and correct your personal data.</li>
            <li>Withdraw consent for data collection and processing.</li>
            <li>Request deletion of your account and data.</li>
          </ul>
          <p className="mt-2">
            Requests can be sent to{" "}
            <a href="mailto:support@campusbites.in" className="text-blue-600 underline">
              support@campusbites.in
            </a>
          </p>
        </Section>

        <Section title="7. Data Retention">
          We retain your data as long as necessary to provide services, comply with legal obligations, or resolve disputes.
        </Section>

        <Section title="8. Third-Party Links">
          Our Platform may link to third-party websites. We are not responsible for their privacy practices and encourage you to review their policies.
        </Section>

        <Section title="9. Children’s Privacy">
          Our Platform is intended for users aged 18+. If under 18, you may use the Platform only under parental/guardian supervision.
        </Section>

        <Section title="10. Changes to this Policy">
          We may update this Privacy Policy from time to time. Changes are effective upon posting. Continued use implies acceptance.
        </Section>

        <Section title="Contact Us">
          <p>
            <strong>SMARTDESH TECHNOLOGIES LLP</strong><br />
            CAMPUS BITES<br />
            Email:{" "}
            <a href="mailto:support@campusbites.in" className="text-blue-600 underline">
              support@campusbites.in
            </a><br />
            Phone: +91 7529052525
          </p>
        </Section>
      </div>
    </main>
  );
}

// Section Component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-2 text-gray-900">{title}</h2>
      <div className="text-gray-700">{children}</div>
    </section>
  );
}
