import {
  FaShieldAlt,
  FaUserMd,
  FaXRay,
  FaBed,
  FaChild,
  FaClock,
  FaPhoneAlt,
  FaStar,
  FaAmbulance,
  FaStethoscope,
  FaHeartbeat,
  FaSyringe,
  FaPills,
  FaBriefcaseMedical,
  FaUserNurse,
  FaHospital,
  FaFileMedical,
  FaAward,
  FaCertificate,
  FaCheckCircle,
  FaThumbsUp,
  FaWheelchair,
  FaCalendarCheck,
  FaCreditCard,
  FaMapMarkerAlt,
} from "react-icons/fa";

// Single source of truth for the 25 admin-curated icons. The admin references
// these in two contexts which key them differently:
//   - decision_tiles JSON  → keyed by React component name ("FaShieldAlt")
//   - CKEditor <i> tags    → keyed by Font Awesome class ("fa-shield-alt")
// Both maps below are derived from this list so they can't drift.
const CURATED_ICONS = [
  { Icon: FaShieldAlt, name: "FaShieldAlt", fa: "fa-shield-alt" },
  { Icon: FaUserMd, name: "FaUserMd", fa: "fa-user-md" },
  { Icon: FaXRay, name: "FaXRay", fa: "fa-x-ray" },
  { Icon: FaBed, name: "FaBed", fa: "fa-bed" },
  { Icon: FaChild, name: "FaChild", fa: "fa-child" },
  { Icon: FaClock, name: "FaClock", fa: "fa-clock" },
  { Icon: FaPhoneAlt, name: "FaPhoneAlt", fa: "fa-phone-alt" },
  { Icon: FaStar, name: "FaStar", fa: "fa-star" },
  { Icon: FaAmbulance, name: "FaAmbulance", fa: "fa-ambulance" },
  { Icon: FaStethoscope, name: "FaStethoscope", fa: "fa-stethoscope" },
  { Icon: FaHeartbeat, name: "FaHeartbeat", fa: "fa-heartbeat" },
  { Icon: FaSyringe, name: "FaSyringe", fa: "fa-syringe" },
  { Icon: FaPills, name: "FaPills", fa: "fa-pills" },
  { Icon: FaBriefcaseMedical, name: "FaBriefcaseMedical", fa: "fa-briefcase-medical" },
  { Icon: FaUserNurse, name: "FaUserNurse", fa: "fa-user-nurse" },
  { Icon: FaHospital, name: "FaHospital", fa: "fa-hospital" },
  { Icon: FaFileMedical, name: "FaFileMedical", fa: "fa-file-medical" },
  { Icon: FaAward, name: "FaAward", fa: "fa-award" },
  { Icon: FaCertificate, name: "FaCertificate", fa: "fa-certificate" },
  { Icon: FaCheckCircle, name: "FaCheckCircle", fa: "fa-check-circle" },
  { Icon: FaThumbsUp, name: "FaThumbsUp", fa: "fa-thumbs-up" },
  { Icon: FaWheelchair, name: "FaWheelchair", fa: "fa-wheelchair" },
  { Icon: FaCalendarCheck, name: "FaCalendarCheck", fa: "fa-calendar-check" },
  { Icon: FaCreditCard, name: "FaCreditCard", fa: "fa-credit-card" },
  { Icon: FaMapMarkerAlt, name: "FaMapMarkerAlt", fa: "fa-map-marker-alt" },
];

export const ICON_MAP = Object.fromEntries(
  CURATED_ICONS.map(({ name, Icon }) => [name, Icon]),
);

export const CK_ICON_FA_MAP = Object.fromEntries(
  CURATED_ICONS.map(({ fa, Icon }) => [fa, Icon]),
);

// Pass to html-react-parser's `parse(html, richTextParseOptions)` to render
// CKEditor HTML on the front-end, swapping admin-inserted Font Awesome <i>
// tags for their react-icons equivalents (color preserved).
export const richTextParseOptions = {
  replace: (node) => {
    if (!node.attribs || node.name !== "i") return;
    const match = (node.attribs.class || "").match(/\bfa-[a-z0-9-]+\b/);
    if (!match) return;
    const Icon = CK_ICON_FA_MAP[match[0]];
    if (!Icon) return;
    const colorMatch = (node.attribs.style || "").match(/color:\s*([^;]+)/);
    const color = colorMatch ? colorMatch[1].trim() : undefined;
    return <Icon style={color ? { color } : undefined} />;
  },
};
