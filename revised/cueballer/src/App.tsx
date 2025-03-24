import React from 'react'
import './App.css'
import { useState, useEffect } from 'react'
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField'
import { FormControlLabel, FormGroup, Slider } from '@mui/material'
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
      className={'small-text-input white-back'}
      id="cues"
      autoComplete="off"
      placeholder="paste me"
      value={text}
      multiline
      variant="outlined"
      fullWidth
      onChange={e => onChange(e.target.value)}
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

  const [state, setState] = useState<MyState>(INIT_STATE);

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

  const changeSelectedActor = (c : string) => (event) => {
    let newSelectedActors = state.selectedCharacters;
    if (event.target.checked && !state.selectedCharacters.has(c)) {
      newSelectedActors.add(c)  
    } else if (!event.target.checked && state.selectedCharacters.has(c)) {
      newSelectedActors.delete(c)
    }
    setSelectedCharacters(newSelectedActors)
  }

  const checkboxes = (Array.from(state.parsedScript?.allActors ?? [])).map((t, i) => <FormControlLabel control={<Checkbox onChange={changeSelectedActor(t)} />} label={t} key={i}/>);

  return <div className="main-container flexcols">
    <div className="full-script flexrows flexkid">
      <div className="script-header flexkid white-back"><h2>Upload your script file</h2></div>
      <div className="script-editor flexkid white-back upload-container">
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
            sx={{ height: '50px', margin: '20px auto', display: 'flex' }}
          >
            Upload Script File
          </Button>
        </label>
        {state.fileName && <p>Loaded: {state.fileName}</p>}
      </div>
    </div>
    {(state.parsedScript?.allActors.size ?? 0) > 0 &&
      <div className="flexcols flexkid">
        <div className="cue-selector flexrows flexkid colblock white-back ">
          <div className="select-header "><h2>Choose the characters to use.</h2></div>
          <FormGroup>
            {checkboxes}
          </FormGroup>
          <div><h2># of words in cue</h2></div>
          <Slider
            aria-label="n words in cue"
            defaultValue={DEFAULT_NUM_CUE_WORDS}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={MAX_NUM_CUE_WORDS}
            onChangeCommitted={(_, v) => {
              setState({ ...state, nWordsInCueScript: v as number})
            }}
          />
          <div><h2># of letters in a line</h2></div>
          <Slider
            aria-label="line length"
            defaultValue={DEFAULT_NUM_CHARS_PER_LINE}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={MIN_CHARS_PER_LINE}
            max={MAX_CHARS_PER_LINE}
            onChangeCommitted={(e, v) => {
              setState({ ...state, nCharsInLine: v as number})
            }}
          />
        </div>
        <div className="cue-script white-back flexrows flexkid">
          <div className="flexcols flexkid">
            <EditableText text={state.cueScript} onChange={onChangeCueScript} />
          </div>
        </div>
      </div>
    }
  </div>
}

export default App;
