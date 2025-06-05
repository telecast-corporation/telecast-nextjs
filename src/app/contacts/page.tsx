'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

export default function Contacts() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://formsubmit.co/admin@telecast.ca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/thank-you');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <main style={{ maxWidth: 800, margin: '4rem auto', padding: '2rem', borderRadius: 12, backgroundColor: '#f0f9ff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', fontFamily: 'Open Sans, sans-serif' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#007bff', marginBottom: '1.5rem' }}>Contact Us</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <input type="hidden" name="_captcha" value="false" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="name" style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#000' }}>Your Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name" 
            style={{ 
              padding: '0.75rem', 
              border: '1px solid #cbd5e1', 
              borderRadius: 8,
              backgroundColor: '#fff',
              color: '#000'
            }} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="email" style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#000' }}>Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email" 
            style={{ 
              padding: '0.75rem', 
              border: '1px solid #cbd5e1', 
              borderRadius: 8,
              backgroundColor: '#fff',
              color: '#000'
            }} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="message" style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#000' }}>Message</label>
          <textarea 
            id="message" 
            name="message" 
            rows={5} 
            required 
            value={formData.message}
            onChange={handleChange}
            placeholder="Write your message here..." 
            style={{ 
              padding: '0.75rem', 
              border: '1px solid #cbd5e1', 
              borderRadius: 8,
              backgroundColor: '#fff',
              color: '#000'
            }} 
          />
        </div>
        <Button 
          type="submit" 
          sx={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer', 
            transition: 'background-color 0.3s ease',
            '&:hover': {
              backgroundColor: '#0056b3'
            }
          }}
        >
          Send Message
        </Button>
      </form>
    </main>
  );
} 