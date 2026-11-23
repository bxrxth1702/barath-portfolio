import {
  FaHome, FaUser, FaLayerGroup, FaBriefcase, FaFolderOpen, FaEnvelope, FaTimes,
} from "react-icons/fa";
import avatar from "../assets/hero.png";
import "./Sidebar.css";

const items = [
  { label: "Home", href: "#home", icon: <FaHome /> },
  { label: "About", href: "#about", icon: <FaUser /> },
  { label: "Roles", href: "#roles", icon: <FaLayerGroup /> },
  { label: "Experience", href: "#experience", icon: <FaBriefcase /> },
  { label: "Projects", href: "#projects", icon: <FaFolderOpen /> },
  { label: "Contact", href: "#contact", icon: <FaEnvelope /> },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={`sb-overlay ${open ? "show" : ""}`} onClick={onClose} />

      <aside className={`sb-drawer ${open ? "open" : ""}`}>
        <button className="sb-close" onClick={onClose} aria-label="Close menu">
          <FaTimes />
        </button>

        <div className="sb-profile">
          <img src={avatar} alt="Barath M" />
          <div>
            <h3>Barath M</h3>
            <span>AI Engineer · Full Stack Dev</span>
          </div>
        </div>

        <nav className="sb-nav">
          {items.map((item) => (
            <a key={item.label} href={item.href} onClick={onClose}>
              <span className="sb-icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}