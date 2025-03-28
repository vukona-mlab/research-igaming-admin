import React from 'react';
import './contextMenu.css';

export default function ContextMenu() {
    const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

      function showDeclineOptions(event){
        const dropdown = document.querySelector(".decline-menu");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
      }
    return (
        
      < div className="context-menu">
        <h5 className="heading">Actions</h5>
        <ul>
          <li>Approved</li>
          <li className="decline-btn" onClick={showDeclineOptions}>Decline</li>
          <div className="decline-menu">
            <div className="decline-opts">Names don't match</div>
            <div className="decline-opts">Documents not visible</div>
            <div className="decline-opts">Documents not certified</div>
          </div>
          <li>Close</li>
        </ul>
      </div>
    );
  }