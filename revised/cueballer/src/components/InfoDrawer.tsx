import React from 'react';
import { Drawer, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import '../styles/InfoDrawer.css';

interface InfoDrawerProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const InfoDrawer: React.FC<InfoDrawerProps> = ({ open, onClose, isMobile }) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    sx={{
      width: isMobile ? '100%' : '400px',
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: isMobile ? '100%' : '400px',
        boxSizing: 'border-box',
        borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
      },
    }}
  >
    <div className="info-drawer-content">
      <div className="info-drawer-header">
        <Typography variant="h5" component="h2">
          About Cueballer
        </Typography>
        <IconButton 
          aria-label="close info drawer"
          onClick={onClose}
          className="close-drawer-button"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </div>
      <div className="info-drawer-section">
        <Typography variant="h6" component="h3">
          What is it?
        </Typography>
        <Typography variant="body1">
          <p><strong>'Tis Your Cue</strong> is the world's first digital cue script generator. It takes your play script and breaks it out into each actor's individual "part": just their lines, stage directions, and cues.</p>
          <p>Created by Theater in the Open artistic director Edward Speck and built by his friend Ben Swanson in exchange for the promise of one laser cut hurdy gurdy which Ben has yet to recieve, using digital texts from our friends at ShakespearesWords.com, <strong>'Tis Your Cue</strong> for the first time allows anyone with an internet connection to produce theater the way that Shakespeare's own company did.</p>
          <p>Most importantly, you can download our files to edit or upload your own, so your cue scripts are unique to your production.</p>
        </Typography>
      </div>
      <div className="info-drawer-section">
        <Typography variant="h6" component="h3">
          How to Use it
        </Typography>
        <Typography variant="body1">
          <p>1. Upload your script file or choose one of ours</p>
          <p>2. Select your character(s)</p>
          <p>3. Adjust cue settings if needed</p>
          <p>4. Copy or download your personalized cue script to print</p>
          <p>To learn more visit <a href="https://theaterintheopen.org/tisyourcue">theaterintheopen.org/tisyourcue</a></p>
          <p>Questions? Reach out to <a href="mailto:edward@theaterintheopen.org">edward@theaterintheopen.org</a></p>
        </Typography>
      </div>
    </div>
  </Drawer>
);

export default InfoDrawer;
