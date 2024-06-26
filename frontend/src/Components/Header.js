import React from 'react';

// Header Component
function Header() {
    return (
      <div className="d-flex mt-3">
        <div className="flex-shrink-0">
          <img src="logo.png" width="128" height="128" alt="Logo" />
        </div>
        <div className="flex-grow-1 ms-3">
          <h1 className="mt-3">Steam Sale Notifier</h1>
          <p className="text-muted">Stay updated with Discord notifications for new Steam sales!</p>
        </div>
      </div>
    );
}

export default Header;