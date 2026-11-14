import { useState } from 'react';
import { List } from '@phosphor-icons/react';

interface HeaderProps {
  drawerId: string;
  userName: string;
  avatarUrl: string;
}

export function Header({ drawerId, userName, avatarUrl }: HeaderProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const initial = userName.trim().charAt(0).toUpperCase() || '?';

  return (
    <header className="flex items-center gap-3">
      <div className="flex-none lg:hidden">
        <label
          htmlFor={drawerId}
          className="btn btn-square btn-ghost drawer-button"
          aria-label="Abrir menu"
        >
          <List size={24} />
        </label>
      </div>

      <div className="avatar shrink-0">
        <div className="w-10 lg:w-16 rounded-full border border-base-300">
          {imageFailed || !avatarUrl ? (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-content">
              {initial}
            </span>
          ) : (
            <img
              src={avatarUrl}
              alt={`Avatar de ${userName}`}
              onError={() => setImageFailed(true)}
            />
          )}
        </div>
      </div>

      <h1 className="text-base lg:text-4xl font-bold tracking-tight">
        Bem vindo, {userName}!
      </h1>
    </header>
  );
}
