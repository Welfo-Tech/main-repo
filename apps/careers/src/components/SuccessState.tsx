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
        Thank you for applying to the Full Stack Internship at Welfo Fiber Optics.
        We have received your application and will review it shortly.
      </p>
      <p>
        If your profile is a strong match we will reach out on the email you provided.
        This usually takes 5–10 business days.
      </p>
    </div>
  );
}
