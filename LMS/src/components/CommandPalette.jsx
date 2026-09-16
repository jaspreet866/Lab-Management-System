import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "./context";
import { useToast } from "./ToastContext";

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme, usertype, setusertype } = useContext(Context);
  const { info, success } = useToast();

  const commands = [
    {
      id: "nav-dashboard",
      title: "Go to Dashboard & Stats",
      category: "Navigation",
      icon: "bi-grid-1x2-fill",
      badge: "Page",
      action: () => navigate("/dashboard"),
    },
    {
      id: "nav-equipment",
      title: "Add Equipment to Inventory",
      category: "Actions",
      icon: "bi-plus-circle-fill",
      badge: "Admin",
      action: () => navigate("/equipment"),
    },
    {
      id: "nav-lab",
      title: "Setup New Laboratory",
      category: "Actions",
      icon: "bi-building-fill-gear",
      badge: "Admin",
      action: () => navigate("/lab"),
    },
    {
      id: "nav-allocate",
      title: "Issue & Allocate Equipment",
      category: "Actions",
      icon: "bi-box-arrow-up-right",
      badge: "Admin",
      action: () => navigate("/allocate"),
    },
    {
      id: "nav-return",
      title: "Record Device Return & Issues",
      category: "Actions",
      icon: "bi-arrow-return-left",
      badge: "Action",
      action: () => navigate("/return"),
    },
    {
      id: "action-theme",
      title: `Switch to ${theme === "light" ? "Dark Mode 🌙" : "Light Mode ☀️"}`,
      category: "Preferences",
      icon: theme === "light" ? "bi-moon-stars-fill" : "bi-sun-fill",
      badge: "Theme",
      action: () => {
        toggleTheme();
        success(`Switched to ${theme === "light" ? "Dark" : "Light"} mode`);
      },
    },
    {
      id: "action-logout",
      title: "Sign Out of LabFlow",
      category: "Account",
      icon: "bi-box-arrow-right",
      badge: "Auth",
      action: () => {
        localStorage.clear();
        setusertype("Guest");
        info("Signed out successfully");
        navigate("/");
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cmd-palette-backdrop" onClick={onClose}>
      <div
        className="cmd-palette-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="cmd-header">
          <i className="bi bi-search cmd-search-icon"></i>
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Type a command or search pages (e.g., Dashboard, Add, Theme)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="cmd-badge-esc" onClick={onClose}>
            ESC
          </span>
        </div>

        <div className="cmd-list-container">
          {filteredCommands.length > 0 ? (
            <ul className="cmd-list">
              {filteredCommands.map((cmd, index) => (
                <li
                  key={cmd.id}
                  className={`cmd-item ${index === selectedIndex ? "active" : ""}`}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="cmd-item-left">
                    <span className="cmd-item-icon">
                      <i className={`bi ${cmd.icon}`}></i>
                    </span>
                    <div className="cmd-item-info">
                      <span className="cmd-item-title">{cmd.title}</span>
                      <span className="cmd-item-category">{cmd.category}</span>
                    </div>
                  </div>
                  <div className="cmd-item-right">
                    <span className="cmd-badge">{cmd.badge}</span>
                    {index === selectedIndex && (
                      <span className="cmd-enter-hint">↵</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="cmd-empty">
              <i className="bi bi-search-heart mb-2 fs-4 text-muted"></i>
              <p className="mb-0 text-muted small">No commands or pages found for "{query}"</p>
            </div>
          )}
        </div>

        <div className="cmd-footer">
          <div className="cmd-footer-hints">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
          <span className="cmd-footer-brand">
            <i className="bi bi-cpu-fill me-1 text-primary"></i> LabFlow QuickBar
          </span>
        </div>
      </div>
    </div>
  );
};
