import React from "react";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import { DEFAULT_NUM_CUE_WORDS, MAX_NUM_CUE_WORDS, DEFAULT_NUM_CHARS_PER_LINE, MIN_CHARS_PER_LINE, MAX_CHARS_PER_LINE } from '../stateTypes';

interface CueScriptSettingsModalProps {
  open: boolean;
  onClose: () => void;
  nWordsInCueScript: number;
  nCharsInLine: number;
  setNWordsInCueScript: (n: number) => void;
  setNCharsInLine: (n: number) => void;
}

const CueScriptSettingsModal: React.FC<CueScriptSettingsModalProps> = ({
  open,
  onClose,
  nWordsInCueScript,
  nCharsInLine,
  setNWordsInCueScript,
  setNCharsInLine,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    aria-labelledby="settings-modal-title"
  >
    <Box className="settings-modal-box" sx={{ minWidth: 280, maxWidth: 350, mx: 'auto', p: 2 }}>
      <div className="modal-header">
        <h2 id="settings-modal-title">Cue Script Settings</h2>
      </div>
      <div className="modal-content">
        <div><h3># of words in cue</h3></div>
        <Slider
          aria-label="n words in cue"
          defaultValue={DEFAULT_NUM_CUE_WORDS}
          value={nWordsInCueScript}
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={MAX_NUM_CUE_WORDS}
          onChange={(_, v) => setNWordsInCueScript(v as number)}
        />
        <div><h3># of letters in a line</h3></div>
        <Slider
          aria-label="line length"
          defaultValue={DEFAULT_NUM_CHARS_PER_LINE}
          value={nCharsInLine}
          valueLabelDisplay="auto"
          step={1}
          marks
          min={MIN_CHARS_PER_LINE}
          max={MAX_CHARS_PER_LINE}
          onChange={(_, v) => setNCharsInLine(v as number)}
        />
        <div className="modal-actions">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onClose}
            sx={{ mt: 2 }}
          >
            Apply
          </Button>
        </div>
      </div>
    </Box>
  </Modal>
);

export default CueScriptSettingsModal;
