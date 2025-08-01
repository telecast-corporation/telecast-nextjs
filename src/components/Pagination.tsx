'use client';

import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showingSummary?: {
    start: number;
    end: number;
    total: number;
  };
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showingSummary 
}: PaginationProps) {
  const theme = useTheme();

  if (totalPages <= 1) return null;

  const getVisiblePageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const pages: (number | string)[] = [];
    
    // Always show first page
    if (currentPage > delta + 2) {
      pages.push(1);
      if (currentPage > delta + 3) {
        pages.push('...');
      }
    }
    
    // Show pages around current page
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Always show last page
    if (currentPage < totalPages - delta - 1) {
      if (currentPage < totalPages - delta - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePageNumbers();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      justifyContent: 'space-between', 
      alignItems: 'center', 
      gap: 2,
      mt: 4,
      mb: 2
    }}>
      {/* Results summary */}
      {showingSummary && (
        <Typography variant="body2" color="text.secondary">
          Showing {showingSummary.start}-{showingSummary.end} of {showingSummary.total} results
        </Typography>
      )}

      {/* Pagination controls */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Previous button */}
        <Button
          variant="outlined"
          size="small"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          startIcon={<ChevronLeft />}
          sx={{ 
            minWidth: 'auto',
            px: 1.5,
            py: 0.5,
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.primary.main + '10',
            },
            '&.Mui-disabled': {
              borderColor: theme.palette.divider,
              color: theme.palette.text.disabled,
            }
          }}
        >
          Prev
        </Button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <Typography 
                key={`ellipsis-${index}`} 
                variant="body2" 
                sx={{ 
                  px: 1,
                  color: theme.palette.text.secondary,
                  userSelect: 'none'
                }}
              >
                ...
              </Typography>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              variant={isActive ? "contained" : "outlined"}
              size="small"
              onClick={() => onPageChange(pageNum)}
              sx={{
                minWidth: 40,
                height: 32,
                px: 1,
                py: 0.5,
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                borderColor: isActive ? theme.palette.primary.main : theme.palette.divider,
                backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
                color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: isActive 
                    ? theme.palette.primary.dark 
                    : theme.palette.primary.main + '10',
                },
                '&:focus': {
                  outline: `2px solid ${theme.palette.primary.main}40`,
                  outlineOffset: 2,
                }
              }}
            >
              {pageNum}
            </Button>
          );
        })}

        {/* Next button */}
        <Button
          variant="outlined"
          size="small"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          endIcon={<ChevronRight />}
          sx={{ 
            minWidth: 'auto',
            px: 1.5,
            py: 0.5,
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.primary.main + '10',
            },
            '&.Mui-disabled': {
              borderColor: theme.palette.divider,
              color: theme.palette.text.disabled,
            }
          }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}