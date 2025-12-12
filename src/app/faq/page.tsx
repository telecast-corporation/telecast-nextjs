'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  useTheme,
} from '@mui/material';
import { ExpandMore, Podcasts, CloudUpload, Share, Mic, Headphones, TrendingUp, Support } from '@mui/icons-material';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    question: "What does Telecast offer?",
    answer: "Telecast offers unlimited podcast hosting with automatic distribution to major platforms including Spotify, Apple Podcasts, Google Podcasts, Amazon Music, and more. You get professional recording tools, analytics, monetization options, and a complete podcast management suite.",
    icon: <Podcasts sx={{ color: 'primary.main' }} />
  },
  {
    question: "Is podcast hosting really unlimited?",
    answer: "Yes! We offer truly unlimited hosting with no storage limits, bandwidth restrictions, or episode duration caps. Upload as many episodes as you want, as long as you want, without worrying about hitting limits.",
    icon: <CloudUpload sx={{ color: 'primary.main' }} />
  },
  {
    question: "Which platforms will my podcast be distributed to?",
    answer: "Your podcast will automatically be distributed to Spotify, Apple Podcasts, Google Podcasts, Amazon Music, Stitcher, iHeartRadio, TuneIn, and over 100 other podcast platforms worldwide. We handle all the technical requirements and submissions for you.",
    icon: <Share sx={{ color: 'primary.main' }} />
  },
  {
    question: "Do I need professional recording equipment?",
    answer: "No! You can start recording with just your smartphone or computer microphone. Our platform includes noise reduction, audio enhancement, and professional editing tools to make your recordings sound great regardless of your equipment.",
    icon: <Mic sx={{ color: 'primary.main' }} />
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer 24/7 customer support via live chat, email, and phone. Our team includes podcast experts who can help with technical issues, content strategy, and platform optimization. We also provide extensive documentation and video tutorials.",
    icon: <Support sx={{ color: 'primary.main' }} />
  },
  {
    question: "What makes Telecast different from other platforms?",
    answer: "Unlike other platforms that charge per episode or have storage limits, we offer truly unlimited hosting with one simple price. We focus on providing reliable, user-friendly podcast hosting and distribution services that make it easy to create and share your content with the world.",
    icon: <Podcasts sx={{ color: 'primary.main' }} />
  },
  {
    question: "How do I get started?",
    answer: "Getting started is simple! Sign up for a free account, choose your plan, and you can start recording your first episode within minutes. Our platform provides intuitive tools for recording, editing, and publishing your content directly to major podcast platforms.",
    icon: <Mic sx={{ color: 'primary.main' }} />
  },
  {
    question: "Can I have multiple podcasts under one account?",
    answer: "Yes! You can create and manage multiple podcasts under a single account. Each podcast gets its own RSS feed, analytics dashboard, and distribution channels. Perfect for podcast networks or creators with multiple shows.",
    icon: <Podcasts sx={{ color: 'primary.main' }} />
  }
];

export default function FAQPage() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
            color: theme.palette.primary.main
          }}
        >
          Frequently Asked Questions
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            maxWidth: 600, 
            mx: 'auto',
            fontSize: '1.2rem',
            lineHeight: 1.7
          }}
        >
          Everything you need to know about creating, hosting, and growing your podcast with Telecast
        </Typography>
      </Box>

      {/* FAQ Accordion */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4
        }}
      >
        {faqData.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            sx={{
              '&:not(:last-child)': {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              '&:before': {
                display: 'none',
              },
              '&.Mui-expanded': {
                margin: 0,
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                px: 3,
                py: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 2,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                {faq.icon}
                <Typography 
                  variant="h6" 
                  component="h3"
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: '1.1rem'
                  }}
                >
                  {faq.question}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.6,
                  color: theme.palette.text.secondary,
                  fontSize: '1rem'
                }}
              >
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* CTA Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mt: 6,
        p: 4,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
        border: `1px solid ${theme.palette.primary.main}30`
      }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, fontSize: '1.8rem' }}>
          Ready to Start Your Podcast?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Join thousands of creators who trust Telecast for their podcast hosting and distribution needs.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/record" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              Start Recording Now
            </Box>
          </a>
          <a href="/contact" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1,
                border: `1.5px solid ${theme.palette.primary.main}`,
                color: theme.palette.primary.main,
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Contact Support
            </Box>
          </a>
        </Box>
      </Box>
    </Container>
  );
}
