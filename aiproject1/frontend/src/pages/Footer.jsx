import { Link } from "react-router-dom";
import "./Footer.css";

/* Change links, phone, email and social URLs here */
const COLS = [
  { title: "Watch and follow", links: [["Live matches", "/matches"], ["Highlights", "/matches"], ["Series and tournaments", "/matches"], ["Stories", "/matches"]] },
  { title: "AI Lab", links: [["Win predictor", "/ai-lab"], ["Injury risk", "/ai-lab"], ["AI coach", "/ai-lab"], ["Fantasy XI", "/ai-lab"]] },
  { title: "Help", links: [["Contact us", "/contact"], ["FAQs", "/faq"], ["Terms of use", "/terms"], ["Privacy policy", "/privacy"]] },
];

const SOCIALS = [
  ["X", "https://x.com/"],
  ["Instagram", "https://instagram.com/"],
  ["YouTube", "https://youtube.com/"],
  ["Facebook", "https://facebook.com/"],
];

function Footer() {
  return (
    <footer className="sc-footer">
      <div className="sc-foot-wrap">
        <div className="sc-foot-grid">
          <div className="sc-foot-brand">
            <strong>SmartCricket.comI</strong>
            <p>Live scores, highlights and AI-powered match analysis for every format of cricket.</p>
            <div className="sc-foot-contact">
              <a href="tel:+91 8792470881">+91 8792470881</a>
              <a href="smartcricketai@gmail.com">smartcricketai@gmail.com</a>
            </div>
          </div>

          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map(([label, to]) => (
                  <li key={label}><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="sc-foot-bottom">
          <span>© {new Date().getFullYear()} SmartCricket.com. All rights reserved.</span>
          <div className="sc-socials">
            {SOCIALS.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer">{name}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;