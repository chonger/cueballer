import React from 'react';
import { FormGroup, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import '../styles/CharacterDrawer.css';

interface CharacterDrawerProps {
  open: boolean;
  onClose: () => void;
  checkboxes: React.ReactNode;
  onDeselectAll: () => void;
}

const CharacterDrawer: React.FC<CharacterDrawerProps> = ({ open, onClose, checkboxes, onDeselectAll }) => {
  return (
    <div className="character-drawer-content">
      <div className="character-menu-header">
        <h2>Choose Characters</h2>
        <IconButton 
          aria-label="close character menu"
          onClick={onClose}
          className="close-menu-button"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </div>
      <div className="character-menu-actions">
        <Button 
          size="small" 
          variant="outlined" 
          onClick={onDeselectAll}
          fullWidth
        >
          Deselect All
        </Button>
      </div>
      <div className="character-list-container">
        <FormGroup>
          {checkboxes}
        </FormGroup>
      </div>
    </div>
  );
};

export default CharacterDrawer;
