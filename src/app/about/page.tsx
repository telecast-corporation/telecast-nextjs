'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    image: 'https://via.placeholder.com/300',
    bio: 'With over 15 years of experience in technology and leadership.',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'CTO',
    image: 'https://via.placeholder.com/300',
    bio: 'Expert in cloud architecture and distributed systems.',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Head of Design',
    image: 'https://via.placeholder.com/300',
    bio: 'Leading UX/UI design with a focus on user-centered solutions.',
  },
];

const coreValues = [
  {
    title: 'Innovation',
    description: 'Constantly pushing boundaries to create cutting-edge solutions.',
    icon: <SpeedIcon fontSize="large" color="primary" />,
  },
  {
    title: 'Security',
    description: 'Ensuring the highest level of data protection and privacy.',
    icon: <SecurityIcon fontSize="large" color="primary" />,
  },
  {
    title: 'Collaboration',
    description: 'Working together to achieve exceptional results.',
    icon: <GroupsIcon fontSize="large" color="primary" />,
  },
];

export default function About() {
  return (
    <>
      {/* Features Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', padding: '2rem', justifyContent: 'center', maxWidth: 1200, margin: '4rem auto' }}>
        <div style={{ flex: 1, minWidth: 300, backgroundColor: '#3498db', borderRadius: 16, padding: '2rem', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>
            <span style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>👆</span>User-Friendly Experience
          </h2>
          <p style={{ color: 'white', lineHeight: 1.7 }}>
            At the core of our service, we offer an exceptionally user-friendly platform designed for both novice and seasoned podcasters. Our recording tools are intuitive, allowing creators to focus on content rather than the complexities of technology. Uploading is streamlined to ensure that your podcast reaches your audience without delay or technical hiccups. For listeners, our playback system is optimized for all devices, providing uninterrupted access to their favorite shows anytime, anywhere.
          </p>
        </div>
        <div style={{ flex: 1, minWidth: 300, backgroundColor: '#2980b9', borderRadius: 16, padding: '2rem', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>
            <span style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>👥</span>Community & Collaboration
          </h2>
          <p style={{ color: 'white', lineHeight: 1.7 }}>
            We believe in the power of community. Our platform isn't just a place to host podcasts; it's a thriving ecosystem where listeners can engage directly with creators and each other. We facilitate discussions, feedback loops, and collaborative projects, turning passive listening into an active community experience. Special features like live recording sessions with audience interaction, Q&A segments, and community-driven content suggestions are designed to deepen the connection between podcasters and their audience.
          </p>
        </div>
        <div style={{ flex: 1, minWidth: 300, backgroundColor: '#1f6aa5', borderRadius: 16, padding: '2rem', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>
            <span style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>🌍</span>Content Diversity & Discovery
          </h2>
          <p style={{ color: 'white', lineHeight: 1.7 }}>
            Our directory is curated to showcase the richness of human experience through audio. We commit to promoting a wide array of genres, from the niche to the mainstream, ensuring there's something for everyone. Our recommendation algorithms are tuned not just to user preferences but also to introduce listeners to new horizons, fostering discovery and broadening perspectives. We actively work with creators from underrepresented groups to bring unique voices to the forefront.
          </p>
        </div>
      </div>

      {/* Innovation Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', padding: '3rem 2rem', maxWidth: 1100, margin: 'auto' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <Image 
            src="https://img.freepik.com/free-vector/podcast-concept-illustration_114360-7885.jpg?w=826&t=st=1716210000~exp=1716210600~hmac=9c4dc9b5f997e71669a40e6ec9c3068d19d3c1aa24e39f73ed0e57c8bc207f25" 
            alt="Innovation" 
            width={826}
            height={620}
            style={{ width: '100%', borderRadius: 12 }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#2F4858' }}>Innovation That Elevates Your Voice</h2>
          <p style={{ color: '#2F4858', lineHeight: 1.7, marginTop: '1rem' }}>
            Our tools support emerging formats like 3D audio, choose-your-own-adventure episodes, and smart home integration—so you're not just podcasting, you're pioneering.
          </p>
        </div>
      </div>

      {/* Why Creators Choose Telecast */}
      <div style={{ backgroundColor: '#f0f9ff', padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fa7202' }}>Why Creators Choose Telecast</h2>
        <p style={{ maxWidth: 800, margin: 'auto', marginTop: '1rem', color: '#2F4858' }}>
          From easy tools to audience insights, Telecast is designed for storytellers who want simplicity, power, and growth in one place.
        </p>
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', background: '#f0f9ff', padding: '2rem', margin: '3rem auto', maxWidth: 1000, borderRadius: 12 }}>
        <div style={{ flex: '1 1 200px', textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.2rem', color: '#fa7202' }}>🎧</span>
          <h3 style={{ margin: '0.5rem 0', fontSize: '1.5rem', color: '#2F4858' }}>5,000+</h3>
          <p style={{ fontSize: '1rem', color: '#2F4858' }}>Podcasts Hosted</p>
        </div>
        <div style={{ flex: '1 1 200px', textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.2rem', color: '#0279c3' }}>👥</span>
          <h3 style={{ margin: '0.5rem 0', fontSize: '1.5rem', color: '#2F4858' }}>1M+</h3>
          <p style={{ fontSize: '1rem', color: '#2F4858' }}>Listeners Reached</p>
        </div>
        <div style={{ flex: '1 1 200px', textAlign: 'center' }}>
          <span style={{ fontSize: '2.2rem', color: '#F6AE2D' }}>🚀</span>
          <h3 style={{ margin: '0.5rem 0', fontSize: '1.5rem', color: '#2F4858' }}>98%</h3>
          <p style={{ fontSize: '1rem', color: '#2F4858' }}>Satisfaction Rate</p>
        </div>
      </div>

      {/* Creator Spotlight */}
      <div style={{ maxWidth: 900, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>Creator Spotlight</h2>
        <Image 
          src="https://randomuser.me/api/portraits/women/44.jpg" 
          alt="Jessie T." 
          width={100}
          height={100}
          style={{ borderRadius: '50%', margin: '1rem 0' }}
        />
        <blockquote style={{ fontStyle: 'italic', color: '#4b5563', maxWidth: 700, margin: 'auto' }}>
          "Telecast helped me go from zero to viral. Their tools were easy, and I felt heard every step of the way."
        </blockquote>
        <p style={{ marginTop: '1rem', fontWeight: 600, color: '#1f2937' }}>Jessie T., Host of "Mind Over Mic"</p>
      </div>

      {/* CTA Footer */}
      <div style={{ background: 'linear-gradient(to right, #3b82f6, #9333ea)', padding: '3rem 2rem', borderRadius: 12, textAlign: 'center', color: 'white', marginTop: '4rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Ready to Start Your Podcast Journey?</h2>
        <p style={{ marginTop: '1rem', fontSize: '1.125rem' }}>Join the Telecast community today and turn your voice into impact.</p>
        <Link href="/signup" style={{ marginTop: '1.5rem', display: 'inline-block', padding: '0.75rem 2rem', background: 'white', color: '#3b82f6', fontWeight: 600, borderRadius: 999, textDecoration: 'none' }}>Get Started</Link>
      </div>
    </>
  );
} 