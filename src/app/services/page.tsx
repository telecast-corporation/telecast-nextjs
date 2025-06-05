'use client';

import React from 'react';
import { MdStar, MdConnectWithoutContact, MdPlaylistAddCheck } from 'react-icons/md';
import Box from '@mui/material/Box';

const services = [
  { icon: '🎧', title: 'Audio Production', desc: 'Recording, editing, mixing, and adding effects for high-quality audio.' },
  { icon: '🎨', title: 'Graphic Design', desc: 'Custom cover art, logos, and branding visuals that attract listeners.' },
  { icon: '📣', title: 'Marketing & PR', desc: 'Strategies to promote your podcast via social media, press, and collaborations.' },
  { icon: '🌐', title: 'Website Development', desc: 'Dedicated podcast site with show notes, archives, and listener interaction.' },
  { icon: '⚖️', title: 'Legal Services', desc: 'Help with contracts, copyright, and licensing for peace of mind.' },
  { icon: '📝', title: 'Content Strategy', desc: 'Planning episode themes, guest spots, and scheduling with long-term goals.' },
  { icon: '💰', title: 'Sponsorship & Ads', desc: 'Monetization through curated partnerships and professional ad integration.' },
  { icon: '🚀', title: 'Distribution & Hosting', desc: 'Reliable hosting and analytics to distribute across major platforms.' },
  { icon: '🛠️', title: 'Technical Support', desc: 'Assistance with equipment setup, recording software, and troubleshooting.' },
];

export default function Services() {
  return (
    <main style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto 2rem' }}>
        <h2 style={{ color: '#007bff', marginBottom: '1rem' }}><strong>Empower Your Podcasting Journey</strong></h2>
        <p style={{ lineHeight: 1.6, color: '#334155' }}>
          Telecast brings together the tools, support, and creative professionals you need to turn your podcast vision into reality.
          Whether you're launching your first episode or scaling a growing audience, we're here for every step.
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '2rem', 
        borderRadius: '8px', 
        marginBottom: '2rem' 
      }}>
        <h3 style={{ 
          color: '#0f172a', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <MdStar style={{ color: '#0ea5e9' }} /> Why Choose Telecast?
        </h3>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          We blend cutting-edge technology with human creativity, offering curated services such as audio production, design, legal advice, and growth strategy to help you succeed in the podcasting world.
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '2rem', 
        borderRadius: '8px', 
        marginBottom: '2rem' 
      }}>
        <h3 style={{ 
          color: '#0f172a', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <MdConnectWithoutContact style={{ color: '#0ea5e9' }} /> Join the Community
        </h3>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          Become part of a vibrant community of creators who collaborate, share, and inspire one another. From live Q&As to collaborative projects, we bring creators and listeners together.
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '2rem', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ 
          color: '#0f172a', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <MdPlaylistAddCheck style={{ color: '#0ea5e9' }} /> Services You Might Need
        </h3>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '2rem' }}>
          These services can help you create a polished, professional podcast that attracts and retains listeners:
        </p>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {services.map((service, idx) => (
            <Box key={idx} sx={{
              backgroundColor: 'white',
              p: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }
            }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>{service.icon}</span>
              <span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1.1rem', display: 'block' }}>{service.title}</span>
              <span style={{ display: 'block', color: '#475569', fontSize: '0.95rem', marginTop: '0.5rem' }}>{service.desc}</span>
            </Box>
          ))}
        </div>
      </div>
    </main>
  );
} 