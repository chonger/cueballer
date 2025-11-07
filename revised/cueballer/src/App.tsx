import React from 'react'
import './App.css'
import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField'
import { FormControlLabel, FormGroup, Slider, Modal, Box, IconButton, Menu, MenuItem, Paper, Tooltip, useMediaQuery, useTheme, Drawer, Snackbar, Typography, Divider } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { createCueScript, ParsedScript, parseScript } from './munging';
import { comedyerr } from './demo_data'
import tito from './images/tito.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScroll } from '@fortawesome/free-solid-svg-icons';

/**
 * Convenience wrapper to be used for both the original script and cue script 
 */
export const EditableText = ({
  text,
  onChange,
}) => {
  return (
    <TextField
      className={'small-text-input'}
      id="cues"
      autoComplete="off"
      placeholder="Your cue script will appear here"
      value={text}
      multiline
      variant="outlined"
      fullWidth
      onChange={e => onChange(e.target.value)}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '& .MuiOutlinedInput-root': {
          height: '100%',
          display: 'flex'
        },
        '& .MuiInputBase-root': {
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        },
        '& .MuiInputBase-inputMultiline': {
          overflow: 'auto',
          flexGrow: 1
        }
      }}
    ></TextField>
  )
}

interface MyState {
  originalScript: string
  parsedScript: ParsedScript | null
  cueScript: string
  nWordsInCueScript: number
  nCharsInLine: number
  selectedCharacters: Set<string>
  fileName: string | null
}


// min cue words is 1
const MAX_NUM_CUE_WORDS = 8
const DEFAULT_NUM_CUE_WORDS = 3

const MIN_CHARS_PER_LINE = 30
const MAX_CHARS_PER_LINE = 100
const DEFAULT_NUM_CHARS_PER_LINE = 53

const INIT_STATE : MyState  ={ 
  originalScript: '', 
  parsedScript: null, 
  cueScript: '', 
  nWordsInCueScript: DEFAULT_NUM_CUE_WORDS, 
  nCharsInLine: DEFAULT_NUM_CHARS_PER_LINE, 
  selectedCharacters: new Set(),
  fileName: null
}

/**
 * Provides the UI and tools to transform a properly formatted original script into a
 * ParsedScript data structure, and then to extract cue scripts for any subset of the
 * characters.
 * 
 */
export const App = () => {
  // App-level state, persists across renders
  const [state, setState] = useState<MyState>(INIT_STATE);
  return (
    <Routes>
      <Route path="/text/:textName" element={<PreloadedText />} />
      <Route path="/cueballer" element={<AppContent state={state} setState={setState} />} />
    </Routes>
  );
}

// Add new component for handling preloaded texts
const PreloadedText = () => {
  const { textName } = useParams();
  const [state, setState] = useState<MyState>(INIT_STATE);
  
  useEffect(() => {
    const loadText = async () => {
      try {
        // Use process.env.PUBLIC_URL to ensure correct path in development and production
        const response = await fetch(`${process.env.PUBLIC_URL}/texts/${textName}`);
        if (!response.ok) throw new Error('Text not found');
        const content = await response.text();
        console.log('Loaded text:', textName);
        setState(prevState => ({
          ...prevState,
          originalScript: content,
          fileName: textName || null
        }));
        
        // Parse the script after loading
        const parsed = parseScript(content);
        setState(prevState => ({
          ...prevState,
          parsedScript: parsed,
          selectedCharacters: new Set<string>()
        }));
      } catch (error) {
        console.error('Error loading text:', error);
      }
    };

    if (textName) {
      loadText();
    }
  }, [textName]);

  return <AppContent state={state} setState={setState} />;
};

// Extract main content into a separate component
const AppContent = ({ state, setState }: { state: MyState, setState: React.Dispatch<React.SetStateAction<MyState>> }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [openSettings, setOpenSettings] = useState(false);
  const [characterDrawerOpen, setCharacterDrawerOpen] = useState(false);
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [orientation, setOrientation] = useState(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleOpenInfoDrawer = () => {
    setInfoDrawerOpen(true);
  };
  
  const handleCloseInfoDrawer = () => {
    setInfoDrawerOpen(false);
  };

  // Fix viewport height for mobile browsers
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
    
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  // Handle orientation changes
  useEffect(() => {
    const handleResize = () => {
      // Force a redraw of the page when orientation changes
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      if (orientation !== newOrientation) {
        setOrientation(newOrientation);
        
        // Force refresh layout to fix fullscreen issues on orientation change
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
        
        // In some mobile browsers, we need to scroll to top to fix fullscreen issues
        window.scrollTo(0, 0);
        
        // Force repaint
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
          void containerRef.current.offsetHeight; // Trigger reflow
          containerRef.current.style.display = 'flex';
        }

        // On iOS specifically, additional delay might help with fullscreen restoration
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 300);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Run once on mount to set initial state
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [orientation]);

  const handleOpenSettings = () => setOpenSettings(true);
  const handleCloseSettings = () => setOpenSettings(false);
  
  const handleOpenCharacterDrawer = () => {
    setCharacterDrawerOpen(true);
  };
  
  const handleCloseCharacterDrawer = () => {
    setCharacterDrawerOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const copyToClipboard = () => {
    if (state.cueScript) {
      navigator.clipboard.writeText(state.cueScript)
        .then(() => {
          setSnackbarMessage('Copied to clipboard!');
          setSnackbarOpen(true);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  const downloadCueScript = () => {
    if (state.cueScript) {
      // Create a blob from the text content
      const blob = new Blob([state.cueScript], { type: 'text/plain' });
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      // Set the filename - use character name if only one is selected, otherwise use generic name
      const selectedChars = Array.from(state.selectedCharacters);
      const fileName = selectedChars.length === 1 
        ? `${selectedChars[0]}_cue_script.txt` 
        : 'cue_script.txt';
      
      a.href = url;
      a.download = fileName;
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show notification
      setSnackbarMessage('Cue script downloaded');
      setSnackbarOpen(true);
    }
  };

  const downloadOriginalScript = () => {
    if (state.originalScript) {
      // Create a blob from the text content
      const blob = new Blob([state.originalScript], { type: 'text/plain' });
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      // Use the original filename if available, otherwise use generic name
      const fileName = state.fileName || 'original_script.txt';
      
      a.href = url;
      a.download = fileName;
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show notification
      setSnackbarMessage('Original script downloaded');
      setSnackbarOpen(true);
    }
  };

  const onChangeCueScript = s => setState((state) => ({ ...state, cueScript: s }));
  const setSelectedCharacters = a => setState((state) => ({ ...state, selectedCharacters: a }));

  const updateCueScript = () => {

    if (state.parsedScript == null) {
      return;
    }

    const curActors = Array.from(state.parsedScript.allActors).filter((c) => state.selectedCharacters.has(c))

    const cscript = createCueScript(state.parsedScript, new Set(curActors), state.nWordsInCueScript, state.nCharsInLine)

    if (cscript !== state.cueScript) {
      setState((state) => ({ ...state, cueScript: cscript }))
    }
  }
  useEffect(() => {
    setFileLoaded(state.parsedScript !== null);
    updateCueScript();
  }, [
    state.parsedScript,
    state.selectedCharacters,
    state.nWordsInCueScript,
    state.nCharsInLine,
    state.cueScript
  ]);

  const parseOriginalScript = () => {
    const parsed = parseScript(state.originalScript)
    setState((state) => ({ ...state, parsedScript: parsed, selectedCharacters: new Set() }));
  }

  const handleFileUpload = (event) => {
    if (!event.target || !event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseScript(content);
      setState((state) => ({
        ...state,
        originalScript: content,
        fileName: file.name,
        parsedScript: parsed,
        selectedCharacters: new Set()
      }));
    };
    reader.readAsText(file);
  };

  const handleLoadNewScript = () => {
  setState(INIT_STATE);
  setFileLoaded(false);
  };

  const changeSelectedActor = (c : string) => (event) => {
    const newSelectedActors = new Set(state.selectedCharacters);
    const evt = event as React.ChangeEvent<HTMLInputElement>;
    if (evt.target.checked && !state.selectedCharacters.has(c)) {
      newSelectedActors.add(c)  
    } else if (!evt.target.checked && state.selectedCharacters.has(c)) {
      newSelectedActors.delete(c)
    }
    setSelectedCharacters(newSelectedActors)
  }

  const deselectAllCharacters = () => {
    setSelectedCharacters(new Set());
  };

  const checkboxes = (Array.from(state.parsedScript?.allActors ?? [])).map((t, i) => (
    <FormControlLabel 
      control={<Checkbox checked={state.selectedCharacters.has(t)} onChange={changeSelectedActor(t)} />} 
      label={t} 
      key={i}
    />
  ));

  // Settings modal style
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: {
      xs: '85%',
      sm: '70%',
      md: 400,
    },
    maxWidth: '90vw',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: { xs: 2, sm: 3, md: 4 },
    borderRadius: 2,
    outline: 'none',
  };

  // Character drawer width
  const drawerWidth = isMobile ? '85vw' : isTablet ? '350px' : '400px';

  // Use a dedicated state for file loaded status
  const [fileLoaded, setFileLoaded] = useState(false);


  // Character selection drawer content
  const characterDrawerContent = (
    <div className="character-drawer-content">
      <div className="character-menu-header">
        <h2>Choose Characters</h2>
        <IconButton 
          aria-label="close character menu"
          onClick={handleCloseCharacterDrawer}
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
          onClick={deselectAllCharacters}
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

  const ScriptDropdown = ({ onUpload }: { onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void }) => {
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
          <MenuItem onClick={() => handlePreloadedText('OthelloFolio.txt')}>Othello (Folio)</MenuItem>
          <MenuItem onClick={() => handlePreloadedText('MACFolio.txt')}>Macbeth (Folio)</MenuItem>
          <MenuItem onClick={() => handlePreloadedText('AYLFolio.txt')}>As You Like It (Folio)</MenuItem>
          <MenuItem onClick={() => handlePreloadedText('KLFolio.txt')}>King Lear (Folio)</MenuItem>
          <MenuItem onClick={() => handlePreloadedText('TwelfthNightModern.txt')}>Twelfth Night (Modern)</MenuItem>
          <MenuItem onClick={() => handlePreloadedText('R3Folio.txt')}>Richard III (Folio)</MenuItem>
          <MenuItem onClick={() => handlePreloadedText('RJFolio.txt')}>Romeo and Juliet (Folio)</MenuItem>
          <MenuItem onClick={() => handlePreloadedText('KLModern.txt')}>King Lear (Modern)</MenuItem>
          <MenuItem onClick={() => handlePreloadedText('TempestFolio.txt')}>Tempest (Folio)</MenuItem>
          <MenuItem onClick={() => handlePreloadedText('MNDFolio.txt')}>Midsummer Nights Dream (Folio)</MenuItem>
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

  return (
    <div className="main-container" ref={containerRef} style={{
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#e6e0d4'
    }}>
      <div className={`main-panel ${isMobile ? 'mobile' : ''}`} style={{
        maxWidth: '1500px',
        margin: '0 auto',
        width: '100%',
        backgroundColor: 'transparent'
      }}>
        <div className="top-header" style={{
          marginBottom: '30px',
          backgroundColor: 'white',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div className="header-left">
            <img 
              src={tito}
              alt="Shakespeare" 
              className="shakespeare-logo"
            />
          </div>
          <div className="header-center">
            <h1 className="main-title">Tis your cue.</h1>
            <h2 className="subtitle">The cue script generator</h2>
          </div>
          <div className="header-right">
            <IconButton
              aria-label="help"
              onClick={handleOpenInfoDrawer}
              size="large"
              color="primary"
              sx={{ 
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <Typography 
                variant="h2" 
                component="span"
                sx={{ 
                  fontSize: '4rem',
                  fontWeight: 'bold',
                  lineHeight: 1,
                  color: 'black',
                  fontFamily: '"Jancieni", "Times New Roman", serif',
                  transform: 'translateY(-2px)'
                }}
              >
                ?
              </Typography>
            </IconButton>
          </div>
        </div>
        
        {/* Info Drawer */}
        <Drawer
          anchor="right"
          open={infoDrawerOpen}
          onClose={handleCloseInfoDrawer}
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
                onClick={handleCloseInfoDrawer}
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

  {!fileLoaded ? (
          // Upload interface when no file is loaded
          <div className="upload-interface" style={{
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <div className="upload-container">
              <ScriptDropdown onUpload={handleFileUpload} />
            </div>
          </div>
        ) : (
          // Cue script interface when a file is loaded
          <div className="cue-interface" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            margin: '0 auto',
            width: `${(state.nCharsInLine * 10) + 300}px`,
            maxWidth: '100%'
          }}>
            <div className="cue-script-header">
              <div className="left-controls">
                <IconButton 
                  aria-label="select characters"
                  onClick={handleOpenCharacterDrawer}
                  className="character-button"
                  size={isMobile ? "small" : "medium"}
                  color="primary"
                >
                  <PeopleIcon fontSize={isMobile ? "medium" : "large"} />
                </IconButton>
                <span className={`character-count ${isMobile ? 'mobile' : ''} ${state.selectedCharacters.size === 0 ? 'no-characters' : ''}`}>
                  {state.selectedCharacters.size > 0 
                    ? `${state.selectedCharacters.size} ${isMobile ? '' : 'character'}${state.selectedCharacters.size > 1 && !isMobile ? 's' : ''}` 
                    : isMobile ? '0' : 'No characters selected'}
                </span>
                {!isMobile && (
                  <span className="file-name-display">
                    <span className="file-label">File:</span> {state.fileName}
                  </span>
                )}
              </div>
              <div className="right-controls">
                <Tooltip title="Copy to clipboard">
                  <IconButton 
                    aria-label="copy to clipboard"
                    onClick={copyToClipboard}
                    className="copy-button"
                    size={isMobile ? "small" : "medium"}
                  >
                    <ContentCopyIcon fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download original script">
                  <IconButton 
                    aria-label="download original script"
                    onClick={downloadOriginalScript}
                    className="download-button"
                    size={isMobile ? "small" : "medium"}
                  >
                    <FileDownloadIcon fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Choose a new script">
                  <IconButton 
                    aria-label="choose a new script"
                    onClick={handleLoadNewScript}
                    className="upload-new-button"
                    size={isMobile ? "small" : "medium"}
                  >
                    <FontAwesomeIcon icon={faScroll} style={{ fontSize: isMobile ? "1.2rem" : "1.4rem" }} />
                  </IconButton>
                </Tooltip>
                <IconButton 
                  aria-label="settings"
                  onClick={handleOpenSettings}
                  className="settings-button"
                  size={isMobile ? "small" : "medium"}
                  color="primary"
                >
                  <SettingsIcon fontSize={isMobile ? "medium" : "large"} />
                </IconButton>
              </div>
            </div>
            <div className="cue-script-content">
              {state.selectedCharacters.size === 0 ? (
                <div className="no-characters-message" style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '2rem'
                }}>
                  <PeopleIcon sx={{ fontSize: 60, color: '#777', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", "Times New Roman", serif', mb: 1 }}>
                    No characters selected
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Click the character icon <PeopleIcon sx={{ fontSize: 'small', verticalAlign: 'middle' }} /> in the top left to select characters and generate your cue script.
                  </Typography>
                </div>
              ) : (
                <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <EditableText text={state.cueScript} onChange={onChangeCueScript} />
                </div>
              )}
            </div>

            {/* Character Selection Drawer */}
            <Drawer
              anchor="left"
              open={characterDrawerOpen}
              onClose={handleCloseCharacterDrawer}
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              {characterDrawerContent}
            </Drawer>
          </div>
        )}
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Settings Modal */}
      <Modal
        open={openSettings}
        onClose={handleCloseSettings}
        aria-labelledby="settings-modal-title"
      >
        <Box sx={modalStyle}>
          <div className="modal-header">
            <h2 id="settings-modal-title">Cue Script Settings</h2>
            <IconButton 
              aria-label="close settings"
              onClick={handleCloseSettings}
              className="close-modal-button"
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </div>
          <div className="modal-content">
            <div><h3># of words in cue</h3></div>
            <Slider
              aria-label="n words in cue"
              defaultValue={DEFAULT_NUM_CUE_WORDS}
              value={state.nWordsInCueScript}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={MAX_NUM_CUE_WORDS}
              onChange={(_, v) => {
                setState({ ...state, nWordsInCueScript: v as number})
              }}
            />
            <div><h3># of letters in a line</h3></div>
            <Slider
              aria-label="line length"
              defaultValue={DEFAULT_NUM_CHARS_PER_LINE}
              value={state.nCharsInLine}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={MIN_CHARS_PER_LINE}
              max={MAX_CHARS_PER_LINE}
              onChange={(_, v) => {
                setState({ ...state, nCharsInLine: v as number})
              }}
            />
            <div className="modal-actions">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleCloseSettings}
                sx={{ mt: 2 }}
              >
                Apply
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default App;
