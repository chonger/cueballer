import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScroll } from '@fortawesome/free-solid-svg-icons';
import EditableText from './EditableText';
import ScriptDropdown from './ScriptDropdown';
import CharacterDrawer from './CharacterDrawer';
import InfoDrawer from './InfoDrawer';
import tito from '../images/tito.png';
import { createCueScript, parseScript } from '../munging';
import { MyState, INIT_STATE, MAX_NUM_CUE_WORDS, DEFAULT_NUM_CUE_WORDS, MIN_CHARS_PER_LINE, MAX_CHARS_PER_LINE, DEFAULT_NUM_CHARS_PER_LINE } from '../stateTypes';
import '../styles/AppContent.css';

interface AppContentProps {
  state: MyState;
  setState: React.Dispatch<React.SetStateAction<MyState>>;
}

const AppContent: React.FC<AppContentProps> = ({ state, setState }) => {
  // ...all logic and hooks from previous patch, now inside the function body...
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
  const [fileLoaded, setFileLoaded] = useState(false);

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

  useEffect(() => {
    const handleResize = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      if (orientation !== newOrientation) {
        setOrientation(newOrientation);
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
        window.scrollTo(0, 0);
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
          void containerRef.current.offsetHeight;
          containerRef.current.style.display = 'flex';
        }
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 300);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [orientation]);

  useEffect(() => {
    setFileLoaded(state.parsedScript !== null);
  }, [state.parsedScript]);

  useEffect(() => {
    if (state.parsedScript == null) return;
    const curActors = Array.from(state.parsedScript.allActors).filter((c) => state.selectedCharacters.has(c));
    const cscript = createCueScript(state.parsedScript, new Set<string>(curActors), state.nWordsInCueScript, state.nCharsInLine);
    if (cscript !== state.cueScript) {
      setState((s) => ({ ...s, cueScript: cscript }));
    }
  }, [state.parsedScript, state.selectedCharacters, state.nWordsInCueScript, state.nCharsInLine, state.cueScript, setState]);

  const handleOpenInfoDrawer = () => setInfoDrawerOpen(true);
  const handleCloseInfoDrawer = () => setInfoDrawerOpen(false);
  const handleOpenSettings = () => setOpenSettings(true);
  const handleCloseSettings = () => setOpenSettings(false);
  const handleOpenCharacterDrawer = () => setCharacterDrawerOpen(true);
  const handleCloseCharacterDrawer = () => setCharacterDrawerOpen(false);
  const handleSnackbarClose = () => setSnackbarOpen(false);

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

  const downloadOriginalScript = () => {
    if (state.originalScript) {
      const blob = new Blob([state.originalScript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fileName = state.fileName || 'original_script.txt';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSnackbarMessage('Original script downloaded');
      setSnackbarOpen(true);
    }
  };

  const onChangeCueScript = (s: string) => setState((state) => ({ ...state, cueScript: s }));
  const setSelectedCharacters = (a: Set<string>) => setState((state) => ({ ...state, selectedCharacters: a }));

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const changeSelectedActor = (c: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSelectedActors = new Set(state.selectedCharacters);
    if (event.target.checked && !state.selectedCharacters.has(c)) {
      newSelectedActors.add(c);
    } else if (!event.target.checked && state.selectedCharacters.has(c)) {
      newSelectedActors.delete(c);
    }
    setSelectedCharacters(newSelectedActors);
  };

  const deselectAllCharacters = () => {
    setSelectedCharacters(new Set());
  };

  const checkboxes = (Array.from(state.parsedScript?.allActors ?? [])).map((t, i) => (
    <React.Fragment key={i}>
      <label>
        <input
          type="checkbox"
          checked={state.selectedCharacters.has(t)}
          onChange={changeSelectedActor(t)}
        />
        {t}
      </label>
    </React.Fragment>
  ));

  const modalStyle = {
    position: 'absolute' as const,
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

  const drawerWidth = isMobile ? '85vw' : isTablet ? '350px' : '400px';

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

        <InfoDrawer open={infoDrawerOpen} onClose={handleCloseInfoDrawer} isMobile={isMobile} />

        {!fileLoaded ? (
          <div className="upload-interface" style={{ backgroundColor: 'white', borderRadius: '8px' }}>
            <div className="upload-container">
              <ScriptDropdown onUpload={handleFileUpload} />
            </div>
          </div>
        ) : (
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
              <CharacterDrawer
                open={characterDrawerOpen}
                onClose={handleCloseCharacterDrawer}
                checkboxes={checkboxes}
                onDeselectAll={deselectAllCharacters}
              />
            </Drawer>
          </div>
        )}
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
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
              <SettingsIcon />
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
};

export default AppContent;
