'use client';

import React from 'react';
import { MdStar, MdConnectWithoutContact, MdPlaylistAddCheck } from 'react-icons/md';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { typography, spacing, borderRadius } from '@/styles/typography';

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
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        maxWidth: { xs: '100%', sm: 'md', md: 'lg', lg: 'xl' },
        mx: 'auto',
        p: spacing.component,
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 4,
        fontFamily: 'Open Sans, sans-serif',
      }}
    >
      <Box sx={{ textAlign: 'center', mx: 'auto', mb: spacing.section }}>
        <Typography variant="h2" sx={{ ...typography.title, color: theme.palette.primary.main, mb: spacing.gap, fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' }, fontWeight: 700 }}>
          Empower Your Podcasting Journey
        </Typography>
        <Typography variant="body1" sx={{ ...typography.body, color: theme.palette.text.secondary, fontSize: '1.2rem', lineHeight: 1.7 }}>
          Telecast brings together the tools, support, and creative professionals you need to turn your podcast vision into reality.
          Whether you're launching your first episode or scaling a growing audience, we're here for every step.
        </Typography>
      </Box>

      <Box sx={{ 
        backgroundColor: theme.palette.background.default, 
        p: spacing.section, 
        borderRadius: borderRadius.medium, 
        mb: spacing.section 
      }}>
        <Typography variant="h3" sx={{ 
          ...typography.subheading,
          color: theme.palette.text.primary, 
          mb: spacing.gap,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.7rem' },
          fontWeight: 700
        }}>
          <MdStar style={{ color: theme.palette.primary.main }} /> Why Choose Telecast?
        </Typography>
        <Typography variant="body1" sx={{ ...typography.body, color: theme.palette.text.secondary, fontSize: '1.2rem', lineHeight: 1.7 }}>
          We blend cutting-edge technology with human creativity, offering curated services such as audio production, design, legal advice, and growth strategy to help you succeed in the podcasting world.
        </Typography>
      </Box>

      <Box sx={{ 
        backgroundColor: theme.palette.background.default, 
        p: spacing.section, 
        borderRadius: borderRadius.medium, 
        mb: spacing.section 
      }}>
        <Typography variant="h3" sx={{ 
          ...typography.subheading,
          color: theme.palette.text.primary, 
          mb: spacing.gap,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.7rem' },
          fontWeight: 700
        }}>
          <MdConnectWithoutContact style={{ color: theme.palette.primary.main }} /> Join the Community
        </Typography>
        <Typography variant="body1" sx={{ ...typography.body, color: theme.palette.text.secondary, fontSize: '1.2rem', lineHeight: 1.7 }}>
          Become part of a vibrant community of creators who collaborate, share, and inspire one another. From live Q&As to collaborative projects, we bring creators and listeners together.
        </Typography>
      </Box>

      <Box sx={{ 
        backgroundColor: theme.palette.background.default, 
        p: spacing.section, 
        borderRadius: borderRadius.medium 
      }}>
        <Typography variant="h3" sx={{ 
          ...typography.subheading,
          color: theme.palette.text.primary, 
          mb: spacing.gap,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.7rem' },
          fontWeight: 700
        }}>
          <MdPlaylistAddCheck style={{ color: theme.palette.primary.main }} /> Services You Might Need
        </Typography>
        <Typography variant="body1" sx={{ ...typography.body, color: theme.palette.text.secondary, mb: spacing.section, fontSize: '1.2rem', lineHeight: 1.7 }}>
          These services can help you create a polished, professional podcast that attracts and retains listeners:
        </Typography>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(18.75rem, 1fr))',
          gap: spacing.gap
        }}>
          {services.map((service, idx) => (
            <Box key={idx} sx={{
              backgroundColor: theme.palette.background.paper,
              p: spacing.gap,
              borderRadius: borderRadius.medium,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-0.125rem)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }
            }}>
              <Typography sx={{ fontSize: '2.2rem', display: 'block', mb: '0.5rem' }}>{service.icon}</Typography>
              <Typography sx={{ ...typography.subheading, color: theme.palette.primary.dark, display: 'block', fontSize: '1.6rem', fontWeight: 600 }}>{service.title}</Typography>
              <Typography sx={{ ...typography.body, color: theme.palette.text.secondary, display: 'block', mt: '0.5rem', fontSize: '1.1rem', lineHeight: 1.6 }}>{service.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
} 