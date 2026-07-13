export default function SuccessState() {
  return (
    <div className="success-wrap">
      <div className="success-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2>Application submitted</h2>
      <p>
        We've got your application for the Full Stack Internship at Welfo Fiber Optics.
        We'll go through it and get back to you.
      </p>
      <p>
        If it's a good match we'll reach out on the email you gave us.
        Usually takes 5 to 10 business days.
      </p>
    </div>
  );
}
