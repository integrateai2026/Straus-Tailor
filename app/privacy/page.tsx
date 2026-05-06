import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Straus Tailor Shop',
  description: 'Privacy policy for Straus Tailor Shop, Fargo, ND.',
}

const B  = '#6B1A2C'
const NK = '#17171c'
const CR = '#F7F3EC'

export default function PrivacyPage() {
  return (
    <div style={{ background: '#fff', color: NK, fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh' }}>

      {/* Nav bar */}
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
        <Link href="/" style={{
          fontSize: 13, color: NK, textDecoration: 'none', opacity: 0.65,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
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
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: '#75758a', margin: 0 }}>Last updated: May 01, 2026</p>
        </div>

        {/* Intro */}
        <p style={para}>
          This Privacy Notice for Pabitra Khadka, doing business as Straus Tailor Shop ("we," "us," or "our"), describes how and why we may access, collect, store, use, and share your personal information when you use our services ("Services"), including when you:
        </p>
        <ul style={list}>
          <li style={li}>Visit our website at <a href="https://www.straustailor.com" style={link}>https://www.straustailor.com</a> or any website of ours that links to this Privacy Notice</li>
          <li style={li}>Visit or contact Straus Tailor Shop in person</li>
          <li style={li}>Place an order for tailoring, alterations, repairs, fittings, or related services</li>
          <li style={li}>Communicate with us by phone, text message, email, website form, or other communication method</li>
          <li style={li}>Engage with us in other related ways, including customer service, marketing, reviews, or events</li>
        </ul>
        <p style={para}>Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services.</p>
        <p style={para}>If you still have any questions or concerns, please contact us at:</p>
        <div style={contactBox}>
          <div>Email: <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a></div>
          <div>Phone: <a href="tel:+17019298262" style={link}>701-929-8262</a></div>
          <div>Address: 1326 25th Street South, Fargo, ND 58103, United States</div>
        </div>

        {/* Summary */}
        <Section title="SUMMARY OF KEY POINTS">
          <p style={para}>This summary provides key points from our Privacy Notice. More details are included in the full policy below.</p>
          {[
            ['What personal information do we collect?', 'We may collect personal information that you provide to us, such as your name, phone number, email address, contact preferences, order details, appointment information, and messages you send to us.'],
            ['Do we process sensitive personal information?', 'We do not intentionally collect or process sensitive personal information unless it is necessary for the service you request and you voluntarily provide it.'],
            ['Do we collect information from third parties?', 'We generally collect information directly from you. We may receive information through service providers or business tools used to operate our website, messaging, customer support, or payment systems.'],
            ['How do we use your information?', 'We use your information to provide tailoring services, manage orders, schedule appointments or fittings, respond to questions, send service updates, send SMS messages if you opt in, request reviews, improve our services, and comply with legal obligations.'],
            ['Do we send SMS/text messages?', 'Yes, if you opt in. SMS messages may include appointment reminders, order updates, pickup notifications, missed-call follow-ups, service questions, customer support, and review requests.'],
            ['Do we share mobile information?', 'No mobile information, SMS opt-in data, or SMS consent information will be sold, rented, or shared with third parties or affiliates for marketing or promotional purposes.'],
            ['How can you opt out of SMS messages?', 'You can reply STOP at any time to opt out. For help, reply HELP or contact us at Straustailorshop@gmail.com or 701-929-8262.'],
          ].map(([q, a]) => (
            <div key={q as string} style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: NK, marginBottom: 4 }}>{q}</div>
              <p style={{ ...para, margin: 0 }}>{a}</p>
            </div>
          ))}
        </Section>

        {/* TOC */}
        <Section title="TABLE OF CONTENTS">
          <ol style={{ ...list, listStyleType: 'decimal' }}>
            {[
              'What Information Do We Collect?',
              'How Do We Use Your Information?',
              'SMS Communications',
              'Mobile Information and SMS Consent',
              'How Customers Opt In to SMS',
              'When and With Whom Do We Share Your Personal Information?',
              'How Long Do We Keep Your Information?',
              'How Do We Keep Your Information Safe?',
              'Do We Collect Information From Minors?',
              'What Are Your Privacy Rights?',
              'Controls for Do-Not-Track Features',
              'United States Privacy Rights',
              'Do We Make Updates to This Notice?',
              'How Can You Contact Us About This Notice?',
              'How Can You Review, Update, or Delete the Data We Collect From You?',
            ].map(item => <li key={item} style={li}>{item}</li>)}
          </ol>
        </Section>

        <Section title="1. WHAT INFORMATION DO WE COLLECT?">
          <Subhead>Personal information you disclose to us</Subhead>
          <p style={para}>We collect personal information that you voluntarily provide to us when you contact us, visit our website, place an order, request a service, schedule a fitting, ask a question, complete a form, opt in to receive messages, or otherwise communicate with us.</p>
          <p style={para}>The personal information we collect may include:</p>
          <ul style={list}>{['Names','Phone numbers','Email addresses','Contact preferences','Order details','Service details','Appointment or fitting information','Pickup details','Messages, questions, or requests you send to us','Information related to tailoring, alterations, clothing repairs, fittings, uniforms, wedding dresses, suits, or other services you request'].map(i => <li key={i} style={li}>{i}</li>)}</ul>
          <p style={para}>All personal information that you provide to us must be true, complete, and accurate. You should notify us of any changes to your personal information.</p>
          <Subhead>Sensitive information</Subhead>
          <p style={para}>We do not intentionally collect or process sensitive personal information, such as Social Security numbers, financial account numbers, health information, religious beliefs, racial or ethnic origin, political opinions, or biometric information, unless it is necessary for a service you request and you voluntarily provide it.</p>
          <Subhead>Information automatically collected</Subhead>
          <p style={para}>When you visit our website, certain information may be collected automatically, such as your IP address, browser type, device information, pages visited, and general usage data. This information is used to help operate, protect, and improve our website and Services.</p>
        </Section>

        <Section title="2. HOW DO WE USE YOUR INFORMATION?">
          <p style={para}>We process your personal information for a variety of business purposes, depending on how you interact with us. We may use your information:</p>
          <ul style={list}>{[
            'To provide tailoring, alteration, fitting, repair, and related services',
            'To create, manage, and complete customer orders',
            'To contact you about your order or service',
            'To send pickup notifications',
            'To schedule or confirm appointments and fittings',
            'To respond to questions, messages, and service requests',
            'To follow up on missed calls or customer inquiries',
            'To send SMS/text messages if you have opted in',
            'To request feedback or reviews',
            'To provide customer support',
            'To process payments, returns, or exchanges, if applicable',
            'To improve our services, website, customer experience, and business operations',
            'To send marketing or promotional communications, if permitted by law and your preferences',
            'To post testimonials or reviews, with appropriate permission when required',
            'To protect our business from fraud, misuse, or security issues',
            'To comply with legal, tax, accounting, or regulatory obligations',
          ].map(i => <li key={i} style={li}>{i}</li>)}</ul>
          <p style={para}>We may also process your information for other purposes with your consent.</p>
        </Section>

        <Section title="3. SMS COMMUNICATIONS">
          <p style={para}>If you opt in to receive SMS/text messages from Straus Tailor Shop, we may send text messages related to:</p>
          <ul style={list}>{['Appointment reminders','Fitting reminders','Order updates','Pickup notifications','Missed-call follow-ups','Service questions','Customer support','Review requests','Other updates related to your service with Straus Tailor Shop'].map(i => <li key={i} style={li}>{i}</li>)}</ul>
          <p style={para}>Message frequency may vary depending on your interaction with us. Message and data rates may apply.</p>
          <p style={para}>You may opt out of SMS messages at any time by replying <strong>STOP</strong>. For help, reply <strong>HELP</strong> or contact us at <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a> or <a href="tel:+17019298262" style={link}>701-929-8262</a>.</p>
          <p style={para}>Consent to receive SMS messages is not a condition of purchasing goods or services from Straus Tailor Shop.</p>
          <p style={para}>After you reply STOP, you may receive one final message confirming that you have been unsubscribed. After that, you will no longer receive SMS messages from us unless you opt in again.</p>
        </Section>

        <Section title="4. MOBILE INFORMATION AND SMS CONSENT">
          <p style={para}>We do not sell, rent, or share mobile phone numbers, SMS opt-in data, or SMS consent information with third parties or affiliates for marketing or promotional purposes.</p>
          <p style={para}>Information may be shared with service providers only as needed to support our Services, such as SMS and messaging providers, customer service providers, website providers, technical support providers, and business software providers. These service providers are only permitted to use the information as needed to provide services to Straus Tailor Shop.</p>
          <p style={para}>Text messaging originator opt-in data and consent will not be shared with third parties or affiliates for marketing or promotional purposes.</p>
        </Section>

        <Section title="5. HOW CUSTOMERS OPT IN TO SMS">
          <p style={para}>Customers may opt in to receive SMS/text messages from Straus Tailor Shop in one or more of the following ways:</p>
          <ul style={list}>{[
            'Completing an online form and selecting an unchecked checkbox agreeing to receive SMS messages',
            'Completing an in-store form or tablet form and selecting an unchecked checkbox agreeing to receive SMS messages',
            'Providing consent during the customer intake or order process',
            'Texting Straus Tailor Shop first and continuing the conversation by SMS',
            'Providing consent through another form or process that clearly explains the SMS program',
          ].map(i => <li key={i} style={li}>{i}</li>)}</ul>
          <p style={para}>SMS consent is optional and is not required to purchase goods or services from Straus Tailor Shop.</p>
        </Section>

        <Section title="6. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?">
          <Subhead>Service providers</Subhead>
          <p style={para}>We may share information with third-party service providers who help us operate our business, such as website hosting providers, SMS and communication providers, customer service platforms, payment processors, appointment or scheduling tools, email providers, business software providers, technical support providers, and accounting, legal, or professional advisors. These providers may only use your information as needed to provide services to us.</p>
          <Subhead>Business transfers</Subhead>
          <p style={para}>We may share or transfer your information in connection with a merger, sale of business assets, financing, or acquisition of all or part of our business by another company.</p>
          <Subhead>Legal obligations</Subhead>
          <p style={para}>We may disclose your information when required to do so by law, court order, subpoena, legal process, government request, or to protect our legal rights.</p>
          <Subhead>SMS and mobile information</Subhead>
          <p style={para}>We do not sell, rent, or share mobile phone numbers, SMS opt-in data, or SMS consent information with third parties or affiliates for marketing or promotional purposes.</p>
        </Section>

        <Section title="7. HOW LONG DO WE KEEP YOUR INFORMATION?">
          <p style={para}>We keep personal information only as long as necessary for the purposes described in this Privacy Notice, unless a longer retention period is required or permitted by law. When we no longer need personal information, we may delete it, anonymize it, or securely store it as required by our business and legal obligations.</p>
        </Section>

        <Section title="8. HOW DO WE KEEP YOUR INFORMATION SAFE?">
          <p style={para}>We use reasonable administrative, technical, and physical safeguards to protect personal information from unauthorized access, loss, misuse, disclosure, alteration, or destruction. However, no electronic transmission over the internet or information storage method can be guaranteed to be 100% secure. You should only access our Services within a secure environment.</p>
        </Section>

        <Section title="9. DO WE COLLECT INFORMATION FROM MINORS?">
          <p style={para}>Our Services are not directed to children under 13 years old. We do not knowingly collect, solicit, or process personal information from children under 13. If you believe we may have collected information from a child under 13, please contact us at <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a> or <a href="tel:+17019298262" style={link}>701-929-8262</a>.</p>
        </Section>

        <Section title="10. WHAT ARE YOUR PRIVACY RIGHTS?">
          <p style={para}>Depending on where you live, you may have certain rights regarding your personal information, including:</p>
          <ul style={list}>{[
            'Request access to the personal information we have about you',
            'Request correction of inaccurate personal information',
            'Request deletion of personal information',
            'Withdraw consent where we rely on consent to process your information',
            'Opt out of marketing communications',
            'Opt out of SMS messages by replying STOP',
            'Request information about how we collect, use, and share personal information',
          ].map(i => <li key={i} style={li}>{i}</li>)}</ul>
          <p style={para}>To exercise your privacy rights, contact us at <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a> or <a href="tel:+17019298262" style={link}>701-929-8262</a>.</p>
          <p style={para}>Withdrawing consent does not affect the lawfulness of processing before consent was withdrawn. For SMS messages, you can withdraw consent by replying STOP.</p>
        </Section>

        <Section title="11. CONTROLS FOR DO-NOT-TRACK FEATURES">
          <p style={para}>Some web browsers and mobile operating systems include a Do-Not-Track ("DNT") feature that allows you to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this time, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As a result, we do not currently respond to DNT browser signals. If a standard is adopted that we must follow in the future, we will update this Privacy Notice.</p>
        </Section>

        <Section title="12. UNITED STATES PRIVACY RIGHTS">
          <p style={para}>If you are a resident of certain U.S. states, you may have specific rights regarding your personal information, including the right to know, access, correct, delete, and obtain a copy of your personal information, and the right to opt out of targeted advertising or sale of personal information.</p>
          <p style={para}>We do not sell personal information. We do not sell, rent, or share mobile phone numbers, SMS opt-in data, or SMS consent information with third parties or affiliates for marketing or promotional purposes.</p>
          <p style={para}>To exercise your privacy rights, contact us at <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a> or <a href="tel:+17019298262" style={link}>701-929-8262</a>.</p>
        </Section>

        <Section title="13. DO WE MAKE UPDATES TO THIS NOTICE?">
          <p style={para}>Yes. We may update this Privacy Notice from time to time. The updated version will be indicated by an updated "Last updated" date at the top of this Privacy Notice. We encourage you to review this Privacy Notice regularly to stay informed about how we protect your information.</p>
        </Section>

        <Section title="14. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?">
          <p style={para}>If you have questions or comments about this Privacy Notice, you may contact us:</p>
          <div style={contactBox}>
            <div style={{ fontWeight: 600 }}>Straus Tailor Shop — Pabitra Khadka</div>
            <div>1326 25th Street South, Fargo, ND 58103, United States</div>
            <div>Email: <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a></div>
            <div>Phone: <a href="tel:+17019298262" style={link}>701-929-8262</a></div>
            <div>Website: <a href="https://www.straustailor.com" style={link}>https://www.straustailor.com</a></div>
          </div>
        </Section>

        <Section title="15. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?">
          <p style={para}>Based on applicable laws, you may have the right to request access to the personal information we collect from you, request details about how we have processed it, correct inaccuracies, or request deletion of your personal information. To make such a request, contact us at <a href="mailto:Straustailorshop@gmail.com" style={link}>Straustailorshop@gmail.com</a> or <a href="tel:+17019298262" style={link}>701-929-8262</a>.</p>
        </Section>

        {/* Back link */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${NK}1a` }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: B, textDecoration: 'none', fontSize: 14, fontWeight: 500,
          }}>
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

function Subhead({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 15, fontWeight: 600, color: '#17171c', margin: '20px 0 8px' }}>{children}</h3>
}
