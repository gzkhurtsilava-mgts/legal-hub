'use client';

import { Button } from '@mts-ds/granat2-react-button';
import { TextField } from '@mts-ds/granat2-react-fields';
import { Avatar, NoGenderIcon } from '@mts-ds/granat2-react-avatar';
import { Badge } from '@mts-ds/granat-react-badge';

export default function HomePage() {
  return (
    <main style={{
      padding: '2rem',
      background: 'var(--color-background-lower)',
      minHeight: '100vh'
    }}>
      {/* Заголовок */}
      <h1 style={{
        fontFamily: 'MTSWide-Medium',
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

      {/* Кнопки — должны быть синими #008ae0 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <Button>Основная кнопка</Button>
        <Button variant="secondary">Вторичная</Button>
        <Button disabled>Недоступна</Button>
      </div>

      {/* Поле ввода */}
      <div style={{ maxWidth: '320px', marginBottom: '1.5rem' }}>
        <TextField
          label="Тестовое поле"
          placeholder="Введите текст"
        />
      </div>

      {/* Аватар и бейдж */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Avatar
          firstName="Георгий"
          lastName="Хурцилава"
          size="44"
        />
        <Badge label="Новое" />
        <Badge label="Срочно" color="negative" />
      </div>
    </main>
  );
}