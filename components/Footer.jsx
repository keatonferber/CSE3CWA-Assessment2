import { site } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerShell">
        <span>{site.studentName}</span>
        <span>Student number: {site.studentNumber}</span>
        <span>CSE3CWA Assessment 2</span>
      </div>
    </footer>
  );
}
