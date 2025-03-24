import React from 'react'
import './App.css'
import { useState, useEffect, useRef } from 'react'
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloseIcon from '@mui/icons-material/Close';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField'
import { FormControlLabel, FormGroup, Slider, Modal, Box, IconButton, Menu, MenuItem, Paper, Tooltip, useMediaQuery, useTheme, Drawer } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import { createCueScript, ParsedScript, parseScript } from './munging';
import { comedyerr } from './demo_data'

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [state, setState] = useState<MyState>(INIT_STATE);
  const [openSettings, setOpenSettings] = useState(false);
  const [characterDrawerOpen, setCharacterDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpenSettings = () => setOpenSettings(true);
  const handleCloseSettings = () => setOpenSettings(false);
  
  const handleOpenCharacterDrawer = () => {
    setCharacterDrawerOpen(true);
  };
  
  const handleCloseCharacterDrawer = () => {
    setCharacterDrawerOpen(false);
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
  useEffect(updateCueScript, [state]);

  const parseOriginalScript = () => {
    const parsed = parseScript(state.originalScript)
    setState((state) => ({ ...state, parsedScript: parsed, selectedCharacters: new Set() }));
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setState((state) => ({ 
        ...state, 
        originalScript: content,
        fileName: file.name
      }));
      
      // Parse the script immediately after loading
      setTimeout(() => {
        const parsed = parseScript(content);
        setState((prevState) => ({ 
          ...prevState, 
          parsedScript: parsed, 
          selectedCharacters: new Set() 
        }));
      }, 100);
    };
    reader.readAsText(file);
  };

  const handleLoadNewScript = () => {
    setState(INIT_STATE);
  };

  const changeSelectedActor = (c : string) => (event) => {
    const newSelectedActors = new Set(state.selectedCharacters);
    if (event.target.checked && !state.selectedCharacters.has(c)) {
      newSelectedActors.add(c)  
    } else if (!event.target.checked && state.selectedCharacters.has(c)) {
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

  // Decide what to render based on whether a file has been loaded
  const hasLoadedFile = state.parsedScript !== null;

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

  return (
    <div className="main-container" ref={containerRef}>
      <div className={`main-panel ${isMobile ? 'mobile' : ''}`}>
        {!hasLoadedFile ? (
          // Upload interface when no file is loaded
          <div className="upload-interface">
            <h2>Upload your script file</h2>
            <div className="upload-container">
              <input
                accept="text/plain,.txt"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="contained"
                  color="primary"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  sx={{ 
                    height: { xs: '45px', sm: '50px' }, 
                    margin: '20px auto', 
                    display: 'flex' 
                  }}
                >
                  Upload Script File
                </Button>
              </label>
            </div>
          </div>
        ) : (
          // Cue script interface when a file is loaded
          <div className="cue-interface">
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
                <span className={`character-count ${isMobile ? 'mobile' : ''}`}>
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
                <Tooltip title="Upload new script">
                  <IconButton 
                    aria-label="upload new script"
                    onClick={handleLoadNewScript}
                    className="upload-new-button"
                    size={isMobile ? "small" : "medium"}
                  >
                    <FileUploadIcon fontSize={isMobile ? "small" : "medium"} />
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
              <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <EditableText text={state.cueScript} onChange={onChangeCueScript} />
              </div>
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
