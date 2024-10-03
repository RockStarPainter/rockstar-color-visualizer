import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import styles from "./NavBar.module.css";
import Link from "next/link";

function NavBar() {
  return (
    <Navbar bg="light" className={`${styles.navbar}`} expand="lg">
      <Container>
        {/* Logo */}
        <div className="d-flex align-items-center">
          <Link href="/" className="me-auto">
            <img
              src="/images/rockstar-logo.png"
              alt="Company Logo"
              className={`${styles.logo}`}
            />
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <FontAwesomeIcon icon={faBars} className={styles.barsIcon} />
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="p-2 d-flex align-items-center">
            <Link href="/" className={`m-2 ${styles.navlink}`}>
              HOME
            </Link>

            <Link href="/contact" className={`m-2 ${styles.navlink}`}>
              CONTACT US
            </Link>
            <Link href="/colorvisualiser" className={`m-2 ${styles.navlink}`}>
              COLOR VISUALISER
            </Link>

            {/* Replace GitHub Icon with an autoplay video */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
