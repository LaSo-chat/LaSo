import NavBar from "@/components/ui/NavBar";
import React from "react";

const TermsOfServicePage: React.FC = () => {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="fixed top-0 w-full bg-white shadow-md z-10 flex items-center justify-between p-4">
        <h3 className="text-lg ml-2 font-semibold">Terms of Service</h3>
      </div>

      <main className="flex-1 mt-16 mb-16 px-4 py-6 max-w-2xl mx-auto h-[calc(100vh-8rem)]">
        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            Last Updated: {lastUpdated}
          </div>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700">
              By accessing or using LaSo (the "Service"), you agree to be bound
              by these Terms of Service ("Terms"). If you disagree with any part
              of these terms, you may not access the Service.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              2. Description of Service
            </h2>
            <p className="text-gray-700">
              LaSo is a messaging application that provides real-time
              translation services for text between users communicating in
              different languages. The Service includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Real-time text and voice message translation</li>
              <li>One-on-one and group chat functionality</li>
              <li>User profile management</li>
              <li>Connection features via QR code, email, or phone number</li>
            </ul>
          </section>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              3. Registration and Account Security
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                3.1. You must provide accurate, current, and complete
                information during registration.
              </p>
              <p className="text-gray-700">3.2. You are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  Maintaining the confidentiality of your account credentials
                </li>
                <li>All activities that occur under your account</li>
                <li>
                  Immediately notifying us of any unauthorized use of your
                  account
                </li>
              </ul>
              <p className="text-gray-700">
                3.3. One account per individual is permitted unless explicitly
                authorized otherwise.
              </p>
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              4. Translation Services
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                4.1. While we strive for accuracy, you acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Automatic translations may not be perfect</li>
                <li>
                  The Service should not be used for critical communications
                  where precise translation is essential
                </li>
                <li>
                  We are not liable for any misunderstandings or consequences
                  arising from translation errors
                </li>
              </ul>
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              5. User Content and Conduct
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                5.1. You retain ownership of content you create and share
                through the Service.
              </p>
              <p className="text-gray-700">
                5.2. You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  Share illegal, harmful, threatening, or discriminatory content
                </li>
                <li>Harass, abuse, or harm other users</li>
                <li>Distribute spam or malware</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              6. Privacy and Data Protection
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                6.1. Your use of the Service is also governed by our Privacy
                Policy.
              </p>
              <p className="text-gray-700">6.2. You consent to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  The collection and processing of your messages for translation
                  purposes
                </li>
                <li>The storage of your language preferences and user data</li>
                <li>The use of your data as described in our Privacy Policy</li>
              </ul>
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              7. Contact Information
            </h2>
            <p className="text-gray-700">
              For questions about these Terms, please contact us at
              support@laso.com
            </p>
          </section>
          <div className="h-8" /> {/* Bottom spacing */}
        </div>
      </main>

      <NavBar />
    </div>
  );
};

export default TermsOfServicePage;
