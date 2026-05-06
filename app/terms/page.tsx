import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Straus Tailor Shop',
  description: 'Terms and conditions for Straus Tailor Shop, Fargo, ND.',
}

const B  = '#6B1A2C'
const NK = '#17171c'

export default function TermsPage() {
  return (
    <div style={{ background: '#fff', color: NK, fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px clamp(16px, 4vw, 48px)',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'saturate(180%) blur(12px)',
        borderBottom: '1px solid #f2f2f2',
        boxShadow: '0 1px 20px rgba(0,0,0,0.06)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none', color: NK }}>
          <span style={{ fontFamily: '"Dancing Script", cursive', fontSize: 26, color: B, fontWeight: 600, lineHeight: 1 }}>Straus</span>
          <span style={{ fontSize: 11, letterSpacing: '0.28px', textTransform: 'uppercase' as const }}>Tailor Shop</span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: NK, textDecoration: 'none', opacity: 0.65, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to site
        </Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 48px) 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48, paddingBottom: 32, borderBottom: `1px solid ${NK}1a` }}>
          <div style={{ fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase' as const, color: B, marginBottom: 16 }}>Legal</div>
          <h1 style={{ fontFamily: '"Dancing Script", cursive', fontSize: 'clamp(42px, 6vw, 64px)', fontWeight: 600, color: NK, margin: '0 0 16px', lineHeight: 1.1 }}>
            Terms & Conditions
          </h1>
          <p style={{ fontSize: 14, color: '#75758a', margin: 0 }}>Last updated: May 01, 2026</p>
        </div>

        {/* Agreement intro */}
        <Section title="AGREEMENT TO OUR LEGAL TERMS">
          <p style={para}>We are Pabitra Khadka, doing business as Straus Tailor Shop ("Company," "we," "us," or "our"), a business located at:</p>
          <div style={contactBox}>
            <div>1326 25th Street South</div>
            <div>Fargo, ND 58103</div>
            <div>United States</div>
          </div>
          <p style={para}>We operate the website <a href="https://www.straustailor.com" style={link}>https://www.straustailor.com</a>, as well as any related services, forms, communication channels, and business services that refer or link to these Terms and Conditions ("Legal Terms" or "Terms").</p>
          <p style={para}>You can contact us by:</p>
          <div style={contactBox}>
            <div>Phone: <a href="tel:+17019298262" style={link}>701-929-8262</a></div>
            <div>Email: <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a></div>
            <div>Mail: 1326 25th Street South, Fargo, ND 58103, United States</div>
          </div>
          <p style={para}>These Legal Terms constitute a legally binding agreement between you, whether personally or on behalf of an entity ("you"), and Straus Tailor Shop concerning your access to and use of our website, services, forms, text messages, communications, and related business services.</p>
          <p style={para}>By accessing or using our Services, you agree that you have read, understood, and agreed to be bound by these Legal Terms. If you do not agree with these Legal Terms, you should not use our Services.</p>
          <p style={para}>We may update these Legal Terms from time to time. We will update the "Last updated" date when changes are made. Your continued use of our Services after updates are posted means you accept the revised Terms.</p>
        </Section>

        {/* TOC */}
        <Section title="TABLE OF CONTENTS">
          <ol style={{ ...list, listStyleType: 'decimal' }}>
            {[
              'Our Services','Use of Our Services','Customer Orders and Services',
              'Appointments, Fittings, and Pickup','Payments','SMS Text Messaging Terms',
              'SMS Opt-In','SMS Opt-Out and Help','Message Frequency and Charges',
              'Privacy Policy','Intellectual Property Rights','User Representations',
              'Prohibited Activities','Reviews, Feedback, and Testimonials',
              'Third-Party Websites and Services','Service Management',
              'Modifications and Interruptions','Corrections','Disclaimer',
              'Limitations of Liability','Indemnification','User Data',
              'Electronic Communications and Signatures','Governing Law',
              'Dispute Resolution','California Users and Residents','Miscellaneous','Contact Us',
            ].map(item => <li key={item} style={li}>{item}</li>)}
          </ol>
        </Section>

        <Section title="1. OUR SERVICES">
          <p style={para}>Straus Tailor Shop provides tailoring, alterations, clothing repairs, fittings, and related customer services. Our Services may include:</p>
          <ul style={list}>{['Clothing alterations','Suit alterations','Wedding dress alterations','Uniform alterations','Hemming','Repairs','Fittings','Order updates','Pickup notifications','Customer support','Website forms','Phone, email, and SMS communications','Review requests','Other related tailoring and customer service communications'].map(i => <li key={i} style={li}>{i}</li>)}</ul>
          <p style={para}>The information provided through our website or communications is for general business and customer service purposes only.</p>
        </Section>

        <Section title="2. USE OF OUR SERVICES">
          <p style={para}>You agree to use our Services only for lawful purposes. You agree not to use our website, forms, phone number, email, SMS messaging, or other communication channels for any fraudulent, harmful, abusive, misleading, or unlawful purpose.</p>
          <p style={para}>The Services are intended for users who are at least 18 years old. Persons under the age of 18 should use our Services only with the involvement and permission of a parent or legal guardian.</p>
        </Section>

        <Section title="3. CUSTOMER ORDERS AND SERVICES">
          <p style={para}>When you place an order or request service from Straus Tailor Shop, you agree to provide accurate and complete information, including your name, phone number, service request, and any information needed to complete your order.</p>
          <p style={para}>We may contact you about your order, including to ask questions, confirm details, provide updates, request approval, notify you of pickup, or resolve service-related issues.</p>
          <p style={para}>Completion times, pricing, and service availability may vary depending on the item, service requested, workload, materials, fitting needs, and other business factors.</p>
          <p style={para}>We reserve the right to refuse service where appropriate, including for items or requests we cannot complete, unsafe or unsanitary items, abusive conduct, or requests outside the scope of our business.</p>
        </Section>

        <Section title="4. APPOINTMENTS, FITTINGS, AND PICKUP">
          <p style={para}>Some services may require an appointment, fitting, or in-person visit. You are responsible for arriving on time for appointments or fittings. If you need to cancel or reschedule, please contact us as soon as possible.</p>
          <p style={para}>We may contact you by phone, email, or SMS (if you have opted in) for appointment reminders, fitting reminders, order updates, and pickup notifications.</p>
          <p style={para}>Customers are responsible for picking up completed items in a timely manner.</p>
        </Section>

        <Section title="5. PAYMENTS">
          <p style={para}>Payment terms may vary depending on the service, order, or item. We may require payment before, during, or after completion of services. Prices may vary depending on the type of clothing, complexity of work, materials, urgency, or other service needs.</p>
          <p style={para}>If payment processing is handled through a third-party provider, that provider may have its own terms, privacy policy, and processing practices.</p>
        </Section>

        <Section title="6. SMS TEXT MESSAGING TERMS">
          <p style={para}>By opting in to receive SMS/text messages from Straus Tailor Shop, you agree to receive text messages from us at the mobile phone number you provide. SMS messages may include:</p>
          <ul style={list}>{['Appointment reminders','Fitting reminders','Order updates','Pickup notifications','Missed-call follow-ups','Service questions','Customer support messages','Review requests','Other updates related to your service with Straus Tailor Shop'].map(i => <li key={i} style={li}>{i}</li>)}</ul>
          <p style={para}>Message frequency may vary depending on your interaction with us. Message and data rates may apply. Consent to receive SMS messages is not a condition of purchasing goods or services from Straus Tailor Shop.</p>
        </Section>

        <Section title="7. SMS OPT-IN">
          <p style={para}>You may opt in to receive SMS messages from Straus Tailor Shop in one or more of the following ways:</p>
          <ul style={list}>{[
            'Completing an online form and selecting an unchecked checkbox agreeing to receive SMS messages',
            'Completing an in-store form or tablet form and selecting an unchecked checkbox agreeing to receive SMS messages',
            'Providing consent during the customer intake or order process',
            'Texting Straus Tailor Shop first and continuing the conversation by SMS',
            'Providing consent through another form or process that clearly explains the SMS program',
          ].map(i => <li key={i} style={li}>{i}</li>)}</ul>
          <p style={para}>SMS consent is optional and is not required to purchase goods or services.</p>
        </Section>

        <Section title="8. SMS OPT-OUT AND HELP">
          <p style={para}>You may opt out of SMS messages at any time by replying <strong>STOP</strong> to any SMS message from Straus Tailor Shop. After you reply STOP, you may receive one final confirmation message. After that, you will no longer receive SMS messages unless you opt in again.</p>
          <p style={para}>For help, reply <strong>HELP</strong> to any SMS message, or contact us directly:</p>
          <div style={contactBox}>
            <div>Phone: <a href="tel:+17019298262" style={link}>701-929-8262</a></div>
            <div>Email: <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a></div>
          </div>
        </Section>

        <Section title="9. MESSAGE FREQUENCY AND CHARGES">
          <p style={para}>Message frequency may vary based on your interaction with Straus Tailor Shop. For example, you may receive messages when you place an order, schedule a fitting, your order status changes, your item is ready for pickup, we need to ask a service-related question, you contact us and we respond, or we request feedback after service.</p>
          <p style={para}>Message and data rates may apply to SMS messages sent or received. Your mobile carrier determines those rates based on your mobile plan. Carriers are not liable for delayed or undelivered messages.</p>
        </Section>

        <Section title="10. PRIVACY POLICY">
          <p style={para}>Your privacy is important to us. Please review our <Link href="/privacy" style={link}>Privacy Policy</Link> to understand how we collect, use, store, and protect personal information.</p>
          <p style={para}>We do not sell, rent, or share mobile phone numbers, SMS opt-in data, or SMS consent information with third parties or affiliates for marketing or promotional purposes.</p>
        </Section>

        <Section title="11. INTELLECTUAL PROPERTY RIGHTS">
          <p style={para}>Our website, content, text, graphics, photos, logos, service descriptions, designs, and other materials are owned by or licensed to Straus Tailor Shop, unless otherwise stated.</p>
          <p style={para}>You may access and use our website and content for personal, non-commercial purposes related to learning about or using our Services. You may not copy, reproduce, distribute, sell, modify, publish, or exploit our content for commercial purposes without our prior written permission.</p>
          <p style={para}>To request permission to use any content, contact us at <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a>.</p>
        </Section>

        <Section title="12. USER REPRESENTATIONS">
          <p style={para}>By using our Services, you represent and warrant that:</p>
          <ul style={list}>{[
            'You have the legal capacity to agree to these Terms',
            'You will comply with these Terms',
            'You will provide accurate and complete information',
            'You will not use the Services for unlawful or unauthorized purposes',
            'Your use of the Services will not violate any applicable law or regulation',
            'You will not interfere with or disrupt the operation of our website, forms, messaging, or business systems',
          ].map(i => <li key={i} style={li}>{i}</li>)}</ul>
          <p style={para}>If you provide information that is inaccurate, incomplete, false, or misleading, we may refuse service, cancel requests, or limit your access to the Services.</p>
        </Section>

        <Section title="13. PROHIBITED ACTIVITIES">
          <p style={para}>You may not use our Services to:</p>
          <ul style={list}>{[
            'Violate any law or regulation',
            'Submit false, misleading, or fraudulent information',
            'Harass, abuse, threaten, or harm any person',
            'Send spam or unauthorized messages',
            'Attempt to interfere with our website, systems, or communications',
            'Upload or transmit viruses, malware, or harmful code',
            'Copy or scrape content from our website without permission',
            'Use automated systems, bots, or scripts to access our Services without authorization',
            'Impersonate another person or business',
            'Attempt to gain unauthorized access to our systems',
            'Use our Services for any improper or unlawful purpose',
          ].map(i => <li key={i} style={li}>{i}</li>)}</ul>
          <p style={para}>We reserve the right to take appropriate action if prohibited activity occurs, including refusing service, blocking access, or reporting unlawful conduct.</p>
        </Section>

        <Section title="14. REVIEWS, FEEDBACK, AND TESTIMONIALS">
          <p style={para}>You may choose to provide feedback, reviews, testimonials, photos, comments, or other submissions to Straus Tailor Shop. By providing feedback or submissions, you give us permission to use them for business purposes, including improving our Services and, where appropriate, displaying reviews or testimonials.</p>
          <p style={para}>We will not knowingly publish private personal information without appropriate permission. We may request reviews by SMS, email, phone, or other communication methods if permitted by your preferences and applicable law.</p>
        </Section>

        <Section title="15. THIRD-PARTY WEBSITES AND SERVICES">
          <p style={para}>Our website or communications may contain links to third-party websites or services, such as review platforms, payment processors, map services, messaging providers, scheduling tools, or social media pages. We are not responsible for the content, policies, security, or practices of third-party websites or services. Your use of third-party websites or services is subject to their own terms and privacy policies.</p>
        </Section>

        <Section title="16. SERVICE MANAGEMENT">
          <p style={para}>We reserve the right to manage our website, forms, communications, and business systems in a manner designed to protect our business, customers, and Services. We may monitor usage, correct errors, restrict access, update information, remove content, or take other action needed to operate and protect our Services.</p>
        </Section>

        <Section title="17. MODIFICATIONS AND INTERRUPTIONS">
          <p style={para}>We may update, modify, suspend, or discontinue parts of our Services at any time. We do not guarantee that our website, forms, phone systems, SMS systems, email systems, or other communication tools will always be available, uninterrupted, secure, or error-free.</p>
          <p style={para}>We are not responsible for delays, failures, or interruptions caused by third-party providers, technical issues, internet outages, carrier issues, system maintenance, or events outside our reasonable control.</p>
        </Section>

        <Section title="18. CORRECTIONS">
          <p style={para}>There may be information on our website, forms, communications, or Services that contains typographical errors, inaccuracies, omissions, pricing errors, availability errors, or service description errors. We reserve the right to correct errors, update information, change pricing, or modify service details at any time without prior notice.</p>
        </Section>

        <Section title="19. DISCLAIMER">
          <p style={para}>Our Services are provided on an "as-is" and "as-available" basis. To the fullest extent permitted by law, we disclaim warranties, express or implied, related to the Services, including warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
          <p style={para}>We do not guarantee that the Services will always meet your expectations, be available without interruption, or be free from errors. Tailoring and alteration results may vary based on garment condition, material, construction, fit, prior alterations, customer requests, and other factors.</p>
        </Section>

        <Section title="20. LIMITATIONS OF LIABILITY">
          <p style={para}>To the fullest extent permitted by law, Straus Tailor Shop will not be liable for indirect, incidental, special, consequential, or punitive damages, including lost profits, lost data, business interruption, or loss of goodwill.</p>
          <p style={para}>Our liability for any claim related to the Services will be limited to the amount you paid for the specific service giving rise to the claim, unless applicable law requires otherwise. Nothing in these Terms is intended to limit rights that cannot be limited under applicable law.</p>
        </Section>

        <Section title="21. INDEMNIFICATION">
          <p style={para}>You agree to defend, indemnify, and hold harmless Straus Tailor Shop, including its owner, employees, contractors, and representatives, from claims, damages, losses, liabilities, costs, or expenses arising from:</p>
          <ul style={list}>{[
            'Your use of the Services',
            'Your violation of these Terms',
            'Your violation of any law or regulation',
            'Your submission of false or misleading information',
            'Your violation of another person\'s rights',
            'Your misuse of our website, forms, communications, or systems',
          ].map(i => <li key={i} style={li}>{i}</li>)}</ul>
        </Section>

        <Section title="22. USER DATA">
          <p style={para}>We may maintain certain data that you provide to us for the purpose of operating our business, completing orders, communicating with customers, and maintaining business records. Although we take reasonable steps to protect information, you are responsible for providing accurate information and for keeping your own records when needed.</p>
          <p style={para}>Please review our <Link href="/privacy" style={link}>Privacy Policy</Link> for more information about how we collect, use, store, and protect personal information.</p>
        </Section>

        <Section title="23. ELECTRONIC COMMUNICATIONS AND SIGNATURES">
          <p style={para}>Visiting our website, completing online forms, sending emails, texting us, or communicating with us electronically constitutes electronic communication. You consent to receive electronic communications from us.</p>
          <p style={para}>You agree that communications, notices, disclosures, agreements, and other records provided electronically satisfy any legal requirement that such communication be in writing, where permitted by law. You agree to the use of electronic signatures, records, and communications where applicable.</p>
        </Section>

        <Section title="24. GOVERNING LAW">
          <p style={para}>These Terms are governed by the laws of the State of North Dakota, United States, without regard to conflict of law principles.</p>
        </Section>

        <Section title="25. DISPUTE RESOLUTION">
          <p style={para}>If a dispute arises between you and Straus Tailor Shop, you agree to first contact us and attempt to resolve the issue informally:</p>
          <div style={contactBox}>
            <div>Email: <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a></div>
            <div>Phone: <a href="tel:+17019298262" style={link}>701-929-8262</a></div>
            <div>Mail: 1326 25th Street South, Fargo, ND 58103, United States</div>
          </div>
          <p style={para}>If the dispute cannot be resolved informally, it may be handled in accordance with applicable law in the appropriate courts located in North Dakota.</p>
        </Section>

        <Section title="26. CALIFORNIA USERS AND RESIDENTS">
          <p style={para}>If a complaint with us is not satisfactorily resolved, California users may contact the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs in writing at:</p>
          <div style={contactBox}>
            <div>1625 North Market Blvd., Suite N 112</div>
            <div>Sacramento, California 95834</div>
            <div>Phone: 800-952-5210 or 916-445-1254</div>
          </div>
        </Section>

        <Section title="27. MISCELLANEOUS">
          <p style={para}>These Terms and any policies posted by us on our website or related to our Services constitute the entire agreement between you and Straus Tailor Shop regarding your use of the Services.</p>
          <p style={para}>Our failure to enforce any right or provision of these Terms does not operate as a waiver of that right or provision. If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision will be considered separate from the remaining provisions and will not affect the validity and enforceability of the remaining Terms.</p>
          <p style={para}>There is no joint venture, partnership, employment, or agency relationship created between you and us as a result of these Terms or your use of the Services.</p>
        </Section>

        <Section title="28. CONTACT US">
          <p style={para}>To resolve a complaint, ask a question, or receive more information about use of our Services, please contact us at:</p>
          <div style={contactBox}>
            <div style={{ fontWeight: 600 }}>Straus Tailor Shop — Pabitra Khadka</div>
            <div>1326 25th Street South, Fargo, ND 58103, United States</div>
            <div>Phone: <a href="tel:+17019298262" style={link}>701-929-8262</a></div>
            <div>Email: <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a></div>
            <div>Website: <a href="https://www.straustailor.com" style={link}>https://www.straustailor.com</a></div>
          </div>
        </Section>

        {/* Back link */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${NK}1a` }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: B, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Straus Tailor Shop
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const para: React.CSSProperties = { fontSize: 15, lineHeight: 1.75, color: '#3b3b40', margin: '0 0 14px' }
const list: React.CSSProperties = { paddingLeft: 20, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 6 }
const li:   React.CSSProperties = { fontSize: 15, lineHeight: 1.7, color: '#3b3b40' }
const link: React.CSSProperties = { color: '#6B1A2C', textDecoration: 'underline', textUnderlineOffset: 3 }
const contactBox: React.CSSProperties = {
  background: '#F7F3EC', borderRadius: 10, padding: '16px 20px',
  fontSize: 14, lineHeight: 1.8, color: '#3b3b40',
  display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 14,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid #f2f2f2' }}>
      <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase' as const, color: '#6B1A2C', margin: '0 0 20px' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}
