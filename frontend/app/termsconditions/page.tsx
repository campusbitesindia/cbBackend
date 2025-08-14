"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function TermsConditionsPage() {
  const router = useRouter();

  return (
    <main className="relative max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Close Button - top right inside */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 right-4 p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
      </button>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
        Terms &amp; Conditions
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
        <Section title="1. Acceptance of Terms">
          By accessing or using the Campus Bites website, mobile application, or services (“Platform”), you agree to be bound by these Terms &amp; Conditions and our Privacy Policy. If you do not agree, you must not use the Platform.
        </Section>

        <Section title="2. Eligibility">
          You must be at least 18 years old to create an account and place orders. If you are under 18, you may use the Platform under the supervision of a parent/guardian who agrees to these Terms.
        </Section>

        <Section title="3. User Accounts">
          <ul className="list-disc list-inside space-y-2">
            <li>You must register with accurate details and keep your account credentials secure.</li>
            <li>You are responsible for all activities under your account.</li>
            <li>We may suspend or terminate accounts for any fraudulent, abusive, or illegal activity.</li>
          </ul>
        </Section>

        <Section title="4. Ordering &amp; Payment">
          <ul className="list-disc list-inside space-y-2">
            <li>Prices displayed on the Platform are inclusive of applicable taxes unless stated otherwise.</li>
            <li>Orders are confirmed once payment is received or COD (if available) is verified.</li>
            <li>We accept payments through approved payment gateways in compliance with RBI guidelines.</li>
          </ul>
        </Section>

        <Section title="5. Cancellations &amp; Refunds">
          <ul className="list-disc list-inside space-y-2">
            <li>Cancellations are allowed only before the order is confirmed by the vendor.</li>
            <li>Refunds (if applicable) will be processed to the original payment method within 5–7 business days, subject to bank policies.</li>
            <li>We reserve the right to cancel orders in case of unavailability of items or unforeseen operational issues.</li>
          </ul>
        </Section>

        <Section title="6. Delivery">
          Delivery times are estimates and may vary due to factors beyond our control. In case of delayed or failed delivery, our liability is limited to a refund of the order value (if paid in advance).
        </Section>

        <Section title="7. Prohibited Activities">
          <ul className="list-disc list-inside space-y-2">
            <li>Misuse the Platform for unlawful purposes.</li>
            <li>Post or transmit harmful, abusive, or defamatory content.</li>
            <li>Interfere with the Platform’s operations or security.</li>
          </ul>
        </Section>

        <Section title="8. Intellectual Property">
          All logos, trademarks, content, and software on the Platform are owned by SMARTDESH TECHNOLOGIES LLP. You may not copy, reproduce, or distribute them without written permission.
        </Section>

        <Section title="9. Limitation of Liability">
          We are not liable for food quality, safety, or allergen concerns, which are the responsibility of the respective vendor. We are also not liable for any indirect, incidental, or consequential damages arising from Platform use.
        </Section>

        <Section title="10. Changes to Terms">
          We reserve the right to update these Terms at any time. Continued use of the Platform after changes implies acceptance.
        </Section>

        <Section title="11. Governing Law">
          These Terms are governed by and construed under the laws of India. Disputes shall be subject to the exclusive jurisdiction of the courts in Ludhiana, Punjab, India.
        </Section>

        <Section title="Contact Us">
          <p>
            <strong>SMARTDESH TECHNOLOGIES LLP</strong>
            <br />
            CAMPUS BITES
            <br />
            Email:{" "}
            <a href="mailto:support@campusbites.in" className="text-blue-600 underline">
              support@campusbites.in
            </a>
            <br />
            Phone: +91 7529052525
          </p>
        </Section>
      </div>
    </main>
  );
}

// Section Component for cleaner code
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-2 text-gray-900">{title}</h2>
      <div className="text-gray-700">{children}</div>
    </section>
  );
}
