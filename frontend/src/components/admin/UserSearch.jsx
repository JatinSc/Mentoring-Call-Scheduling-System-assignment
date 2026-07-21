import { useState, useEffect, useRef } from "react";

export function UserSearch({
  users,
  selectedUser,
  onSelectUser,
  placeholder = "Search by name or email..."
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      setSearchTerm(`${selectedUser.name}`);
    } else {
      setSearchTerm("");
    }
  }, [selectedUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full" ref={dropdownRef}>
      <label className="mq-label">Search User</label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          placeholder={placeholder}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!selectedUser) setShowDropdown(true);
          }}
          className="mq-input pr-10"
        />
        {showDropdown && (
          <div className="mq-card mq-scroll absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-white/[0.08] bg-navy-900/95 shadow-2xl">
            {filteredUsers.length === 0 ? (
              <div className="px-4 py-3 text-sm text-ink-500">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    onSelectUser(user);
                    setShowDropdown(false);
                  }}
                  className={`w-full border-b border-white/[0.06] px-4 py-3 text-left transition last:border-0 ${
                    selectedUser?.id === user.id
                      ? "bg-white/[0.08] text-ink-50"
                      : "text-ink-400 hover:bg-white/[0.04] hover:text-ink-50"
                  }`}
                >
                  <div className="font-medium text-sm">{user.name}</div>
                  <div className="text-xs text-ink-500">{user.email}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
