import React from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faBars, faClose } from "@fortawesome/free-solid-svg-icons";
import styles from "./NavBar.module.css";
import Link from "next/link";
function NavBar1(props: any) {
  return (
    <Navbar bg="transparent box-shadow" className={styles.navbar} expand="lg">
      <Container>
        {/* <Link
          className={`${styles.navbarbrand} ${styles.navlink}`}
          onClick={props.handleClose}
          href="/"
        >
          AAkar
        </Link> */}

        <div className="d-flex items-center">
          <Link href="/" onClick={props.handleClose} className="ms-0 h-8 md:h-12 w-40">
            <img
              src="/images/rockstar-logo.png"
              alt="Company Logo"
              className="w-full h-full object-contain"
            />
          </Link>
        </div>
        <Button
          variant="outline-primary"
          className={`${styles.closebtn}`}
          onClick={props.handleClose}
        >
          Close <FontAwesomeIcon icon={faClose} size="1x" />
        </Button>
      </Container>
    </Navbar>
  );
}
export default NavBar1;
