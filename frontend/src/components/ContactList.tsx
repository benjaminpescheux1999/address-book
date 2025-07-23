import React from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Paper, IconButton, Typography, Box, Avatar, useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export interface Contact {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface ContactListProps {
  contacts: Contact[];
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getSectionedContacts(contacts: Contact[]) {
  const sections: { [letter: string]: Contact[] } = {};
  contacts.forEach((c) => {
    const letter = c.name ? c.name[0].toUpperCase() : '#';
    if (!sections[letter]) sections[letter] = [];
    sections[letter].push(c);
  });
  return Object.entries(sections).sort(([a], [b]) => a.localeCompare(b));
}

export default function ContactList({ contacts, onEdit, onDelete }: ContactListProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (contacts.length === 0) {
    return <Paper sx={{ p: 2 }}>Aucun contact.</Paper>;
  }

  const sectioned = getSectionedContacts(contacts);

  return (
    <List>
      {sectioned.map(([letter, group]) => (
        <Box key={letter} sx={{ display: 'flex', alignItems: 'flex-start' }} data-letter={letter}>
          <Box sx={{
            minWidth: isMobile ? 24 : 32,
            mr: isMobile ? 0.5 : 1,
            pt: 1
          }}>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              color="text.secondary"
              sx={{ fontWeight: 'bold' }}
            >
              {letter}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {group.map((c) => (
              <ListItem
                key={c._id || c.email}
                divider
                sx={{
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  py: isMobile ? 1.5 : 1,
                  px: isMobile ? 1 : 2
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  minWidth: 0
                }}>
                  <ListItemAvatar sx={{
                    minWidth: isMobile ? 40 : 48,
                    mr: isMobile ? 1 : 1
                  }}>
                    <Avatar
                      src={c.avatar || undefined}
                      sx={{
                        width: isMobile ? 40 : 48,
                        height: isMobile ? 40 : 48
                      }}
                    >
                      {getInitials(c.name)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={c.name}
                    secondary={
                      <Box sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 0 : 1,
                        flexWrap: 'wrap'
                      }}>
                        <span>{c.email}</span>
                        {!isMobile && <span>—</span>}
                        <span>{c.phone}</span>
                      </Box>
                    }
                    sx={{
                      minWidth: 0,
                      flex: 1,
                      mr: isMobile ? 0 : 2
                    }}
                  />

                  <Box sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 0.5,
                    flexShrink: 0,
                    ml: 'auto',
                    alignItems: isMobile ? 'flex-end' : 'center'
                  }}>
                    <IconButton
                      size={isMobile ? "small" : "medium"}
                      aria-label="edit"
                      onClick={() => onEdit && onEdit(c)}
                      sx={{
                        color: 'grey.600',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size={isMobile ? "small" : "medium"}
                      aria-label="delete"
                      color="error"
                      onClick={() => onDelete && onDelete(c)}
                      sx={{
                        '&:hover': { backgroundColor: 'error.light' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </Box>
        </Box>
      ))}
    </List>
  );
}