'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign up failed');
      router.push('/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '2rem auto', background: '#fff', padding: '2.5rem', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '2rem', fontWeight: 600, fontSize: '1.75rem', color: '#007bff', textAlign: 'center' }}>Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem', background: '#fff', color: '#000' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem', background: '#fff', color: '#000' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem', background: '#fff', color: '#000' }}
        />
        <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#007bff', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 8, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.3s' }} disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
        {error && <p style={{ color: '#dc3545', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
      </form>
      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.95rem', color: '#475569' }}>
        Already have an account? <Link href="/login" style={{ color: '#007bff', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link href="/" style={{ color: '#007bff', fontWeight: 600, textDecoration: 'none' }}>← Back to Home</Link>
      </div>
    </div>
  );
} 