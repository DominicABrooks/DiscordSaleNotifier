import React from 'react';

function Footer() {
  return (
    <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
      <div className="col-md-4 d-flex align-items-center">
        <span className="mb-3 mb-md-0 text-muted">&copy; 2024 Steam Sale Notifier</span>
      </div>
      <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
        <li className="ms-3">
          <a className="text-muted" href="https://discord.com">
            <img src="discord.svg" width="24" height="24" alt="Discord" />
          </a>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;