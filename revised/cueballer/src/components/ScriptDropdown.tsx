import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScroll } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import '../styles/ScriptDropdown.css';

interface ScriptDropdownProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ScriptDropdown: React.FC<ScriptDropdownProps> = ({ onUpload }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    handleClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpload(event);
  };

  const handlePreloadedText = (textName: string) => {
    navigate(`/text/${textName}`);
    handleClose();
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<FontAwesomeIcon icon={faScroll} />}
        onClick={handleClick}
        sx={{
          height: { xs: '55px', sm: '60px' },
          margin: '20px auto',
          display: 'flex',
          fontFamily: '"Playfair Display", "Times New Roman", serif',
          fontSize: '1.2rem',
          letterSpacing: '0.5px',
          textTransform: 'none',
          backgroundColor: '#2c3e50',
          '&:hover': {
            backgroundColor: '#34495e',
          },
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          borderRadius: '4px',
          padding: '8px 24px',
          '& .MuiButton-startIcon': {
            marginRight: '12px',
            '& svg': {
              fontSize: '1.5rem'
            }
          }
        }}
      >
        Choose your script
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: '200px',
            backgroundColor: '#f5f5f5',
            '& .MuiMenuItem-root': {
              fontFamily: '"Playfair Display", "Times New Roman", serif',
              fontSize: '1rem',
              padding: '12px 16px',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            },
            '& .MuiDivider-root': {
              margin: '8px 0',
              backgroundColor: '#bdbdbd',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleUploadClick}>
          Upload your script
        </MenuItem>
        <Divider />
        {[
          { file: 'AYLFolio.txt', name: 'As You Like It (Folio)' },
          { file: 'KLFolio.txt', name: 'King Lear (Folio)' },
          { file: 'KLModern.txt', name: 'King Lear (Modern)' },
          { file: 'MACFolio.txt', name: 'Macbeth (Folio)' },
          { file: 'MNDFolio.txt', name: 'Midsummer Nights Dream (Folio)' },
          { file: 'OthelloFolio.txt', name: 'Othello (Folio)' },
          { file: 'R3Folio.txt', name: 'Richard III (Folio)' },
          { file: 'RJFolio.txt', name: 'Romeo and Juliet (Folio)' },
          { file: 'TempestFolio.txt', name: 'Tempest (Folio)' },
          { file: 'TwelfthNightModern.txt', name: 'Twelfth Night (Modern)' },
        ]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(script => (
            <MenuItem key={script.file} onClick={() => handlePreloadedText(script.file)}>
              {script.name}
            </MenuItem>
          ))}
      </Menu>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".txt"
        onChange={handleFileChange}
      />
    </>
  );
};

export default ScriptDropdown;
