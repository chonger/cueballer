import React, { useEffect, useRef, useState } from 'react';
import { useVhSetter, useOrientationHandler } from './orientationUtils';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Drawer from '@mui/material/Drawer';
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
import { MyState, INIT_STATE } from '../stateTypes';
import '../styles/AppContent.css';
import CueScriptSettingsModal from './CueScriptSettingsModal';

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

  useVhSetter();
  useOrientationHandler(orientation, setOrientation, containerRef);

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

  const drawerWidth = isMobile ? '85vw' : isTablet ? '350px' : '400px';

  return (
    <div className="main-container background-cover" ref={containerRef}>
      <div className={`main-panel${isMobile ? ' mobile' : ''}`}> 
        <div className="top-header">
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
              className="help-icon-button"
            >
              <span className="help-icon">?</span>
            </IconButton>
          </div>
        </div>

        <InfoDrawer open={infoDrawerOpen} onClose={handleCloseInfoDrawer} isMobile={isMobile} />

        {!fileLoaded ? (
          <div className="upload-interface">
            <div className="upload-container">
              <ScriptDropdown onUpload={handleFileUpload} />
            </div>
          </div>
        ) : (
          <div className="cue-interface" style={{ width: `${(state.nCharsInLine * 10) + 300}px` }}>
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
                <div className="no-characters-message">
                  <PeopleIcon className="no-characters-icon" />
                  <span className="no-characters-title">No characters selected</span>
                  <span className="no-characters-desc">
                    Click the character icon <PeopleIcon className="no-characters-inline-icon" /> in the top left to select characters and generate your cue script.
                  </span>
                </div>
              ) : (
                <div className="cue-editable-wrapper">
                  <EditableText text={state.cueScript} onChange={onChangeCueScript} />
                </div>
              )}
            </div>
            <Drawer
              anchor="left"
              open={characterDrawerOpen}
              onClose={handleCloseCharacterDrawer}
              className="character-drawer"
              PaperProps={{ className: 'character-drawer-paper', style: { width: drawerWidth } }}
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
      <CueScriptSettingsModal
        open={openSettings}
        onClose={handleCloseSettings}
        nWordsInCueScript={state.nWordsInCueScript}
        nCharsInLine={state.nCharsInLine}
        setNWordsInCueScript={(n) => setState({ ...state, nWordsInCueScript: n })}
        setNCharsInLine={(n) => setState({ ...state, nCharsInLine: n })}
      />
    </div>
  );
};

export default AppContent;
