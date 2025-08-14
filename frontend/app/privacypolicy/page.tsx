"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const sections = [
    {
      title: "1. Information We Collect",
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Personal Information:</strong> Name, email address, phone
            number, delivery address, payment details, and account credentials.
          </li>
          <li>
            <strong>Non-Personal Information:</strong> Device type, browser type,
            IP address, and usage data.
          </li>
          <li>
            <strong>Order Data:</strong> Items ordered, order history, and payment
            method.
          </li>
        </ul>
      ),
    },
    {
      title: "2. How We Use Your Information",
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li>Process orders and payments.</li>
          <li>Deliver food and provide customer support.</li>
          <li>Improve the Platform and personalize your experience.</li>
          <li>
            Send order updates, promotional offers, and important notifications.
          </li>
          <li>Comply with legal and regulatory requirements.</li>
        </ul>
      ),
    },
    {
      title: "3. Sharing Your Information",
      content: (
        <>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Vendors/Canteens:</strong> To process and deliver your
              orders.
            </li>
            <li>
              <strong>Service Providers:</strong> Payment gateways, delivery
              partners, and analytics providers.
            </li>
            <li>
              <strong>Legal Authorities:</strong> When required by law or to
              protect rights, property, or safety.
            </li>
          </ul>
          <p className="mt-2">
            We do not sell or rent your personal information to third parties.
          </p>
        </>
      ),
    },
    {
      title: "4. Data Security",
      content: (
        <p>
          We implement reasonable technical and organizational measures to
          protect your information from unauthorized access, alteration,
          disclosure, or destruction, in compliance with Indian IT laws.
        </p>
      ),
    },
    {
      title: "5. Cookies & Tracking",
      content: (
        <p>
          We use cookies and similar technologies to enhance your browsing
          experience, analyze usage patterns, and deliver personalized offers.
          You may disable cookies in your browser, but some Platform features
          may not function properly.
        </p>
      ),
    },
    {
      title: "6. Your Rights",
      content: (
        <>
          <ul className="list-disc pl-5 space-y-2">
            <li>Access and correct your personal information.</li>
            <li>Withdraw consent for data collection and processing.</li>
            <li>Request deletion of your account and associated data.</li>
          </ul>
          <p className="mt-2">
            Requests can be made via:{" "}
            <a
              href="mailto:support@campusbites.in"
              className="text-blue-600 underline"
            >
              support@campusbites.in
            </a>
          </p>
        </>
      ),
    },
    {
      title: "7. Data Retention",
      content: (
        <p>
          We retain your personal data for as long as necessary to provide
          services, comply with legal obligations, or resolve disputes.
        </p>
      ),
    },
    {
      title: "8. Third-Party Links",
      content: (
        <p>
          Our Platform may contain links to third-party websites. We are not
          responsible for their privacy practices and encourage you to review
          their policies.
        </p>
      ),
    },
    {
      title: "9. Children’s Privacy",
      content: (
        <p>
          Our Platform is intended for users aged 18 and above. If you are under
          18, you may use the Platform only under parental/guardian supervision.
        </p>
      ),
    },
    {
      title: "10. Changes to this Privacy Policy",
      content: (
        <p>
          We may update this Privacy Policy from time to time. Any changes will be
          effective upon posting on the Platform. Continued use of the Platform
          after changes implies acceptance.
        </p>
      ),
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Close Button */}
      <div className="sticky top-0 z-10 bg-white flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Privacy Policy
        </h1>
        <button
          onClick={() => router.back()}
          className="p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
        </button>
      </div>

      <p className="mb-4 text-gray-500">Effective Date: 01/08/2025</p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <p>
            <strong>Entity Name:</strong> SMARTDESH TECHNOLOGIES LLP (“we,” “our,”
            “us”)<br />
            <strong>Brand Name:</strong> Campus Bites
          </p>
          <p className="mt-3">
            We respect your privacy and are committed to protecting your personal
            information. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your data when you use our website, mobile
            application, and related services (“Platform”).
          </p>
        </section>

        {sections.map((section, idx) => (
          <section
            key={idx}
            className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">
              {section.title}
            </h2>
            {section.content}
          </section>
        ))}
      </div>
    </main>
  );
}
