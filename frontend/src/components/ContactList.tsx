import React from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Paper, IconButton, Typography, Box, Avatar } from '@mui/material';
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
  if (contacts.length === 0) {
    return <Paper sx={{ p: 2 }}>Aucun contact.</Paper>;
  }
  const sectioned = getSectionedContacts(contacts);
  return (
    <List>
      {sectioned.map(([letter, group]) => (
        <Box key={letter} sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 32, mr: 1, pt: 1 }}>
            <Typography variant="h6" color="text.secondary">{letter}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            {group.map((c) => (
              <ListItem key={c._id || c.email} divider
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => onEdit && onEdit(c)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" color="error" onClick={() => onDelete && onDelete(c)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={c.avatar || undefined}
                    sx={{ width: 48, height: 48 }}
                  >
                    {getInitials(c.name)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={c.name}
                  secondary={
                    <>
                      <span>{c.email}</span> — <span>{c.phone}</span>
                    </>
                  }
                />
              </ListItem>
            ))}
          </Box>
        </Box>
      ))}
    </List>
  );
}