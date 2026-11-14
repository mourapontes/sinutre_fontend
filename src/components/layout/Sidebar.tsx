import { useNavigate } from 'react-router-dom';
import { SignOut } from '@phosphor-icons/react';

import { NAV_ITEMS } from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { SidebarBrand } from './SidebarBrand';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  drawerId: string;
}

export function Sidebar({ drawerId }: SidebarProps) {
  const expanded = true;
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="drawer-side z-50">
      <label
        htmlFor={drawerId}
        aria-label="Fechar menu"
        className="drawer-overlay"
      />
      <div
        className={`bg-base-100 flex flex-col min-h-full border-r border-base-200 shadow-sm transition-all duration-300 ${
          expanded ? 'w-64 items-start' : 'w-20 items-center'
        }`}
      >
        <SidebarBrand expanded={expanded} />

        <ul className="menu w-full grow pt-4 gap-2">
          {NAV_ITEMS.map(item => (
            <SidebarItem
              key={item.id}
              label={item.label}
              Icon={item.Icon}
              to={item.to}
              expanded={expanded}
            />
          ))}
        </ul>

        <div className="w-full border-t border-base-200 p-2">
          <button
            type="button"
            className="flex h-12 w-full items-center gap-4 rounded-lg px-4 text-left hover:bg-base-200"
            onClick={handleLogout}
          >
            <SignOut size={22} />
            {expanded && <span>Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
