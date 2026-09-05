import Link from "next/link";
import { NavbarWAButton } from "./WAButton";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          Azm<span>a</span>yra
        </Link>
        <NavbarWAButton />
      </div>
    </nav>
  );
}
