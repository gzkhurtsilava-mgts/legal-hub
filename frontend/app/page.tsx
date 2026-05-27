'use client';

import { Button } from '@mts-ds/granat2-react-button';
import { Tooltip } from '@mts-ds/granat2-react-tooltip';

export default function HomePage() {
  return (
    <main style={{
      padding: '2rem',
      background: 'var(--color-background-lower)',
      minHeight: '100vh'
    }}>
      <h1 style={{
        fontFamily: 'MTS Wide',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginBottom: '0.5rem'
      }}>
        Legal Hub
      </h1>
      <p style={{
        color: 'var(--color-text-secondary)',
        marginBottom: '2rem'
      }}>
        Портал БПО МГТС — дизайн-система подключена
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button>Основная кнопка</Button>
        <Button variant="secondary">Вторичная</Button>
        <Tooltip content="Подсказка">
          <Button variant="secondary">Наведи на меня</Button>
        </Tooltip>
      </div>
    </main>
  );
}