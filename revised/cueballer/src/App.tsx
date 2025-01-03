import React from 'react'
import './App.css'
import { useState, useEffect } from 'react'
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add'
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField'
import { FormControlLabel, FormGroup, Slider } from '@mui/material'
import { createCueScript, ParsedScript, parseScript } from './munging';
import { comedyerr } from './demo_data'

export const EditableText = ({
  text,
  onChange,
}) => {
  return (
    <TextField
      className={'small-text-input white-back'}
      id="cues"
      autoComplete="off"
      placeholder="empty"
      value={text}
      multiline
      variant="outlined"
      fullWidth
      onChange={e => onChange(e.target.value)}
    ></TextField>
  )
}

interface MyState {
  text: string
  cueScript: string
  nWordsInCueScript: number
  nLettersInLine: number
  actors: string[]
  parsedScript: ParsedScript | null
}

export const App = () => {

  const [state, setState] = useState<MyState>({ text: comedyerr, cueScript: '', actors: [], parsedScript: null, nWordsInCueScript: 5, nLettersInLine: 70 });
  const [selectedActors, setSelectedActors] = useState(new Set());

  const onChangeScript = s => setState((state) => ({ ...state, text: s }));
  const onChangeCueScript = s => setState((state) => ({ ...state, cueScript: s }));
  const updateCueScript = () => {

    if (state.parsedScript == null) {
      return;
    }

    const curActors = state.actors.filter((a, i) => selectedActors.has(i))

    const cscript = createCueScript(state.parsedScript, new Set(curActors), state.nWordsInCueScript, state.nLettersInLine)

    if (cscript !== state.cueScript) {
      setState((state) => ({ ...state, cueScript: cscript }))
    }
  }

  const convertCueScript = () => {
    const parsed = parseScript(state.text)
    setState((state) => ({ ...state, parsedScript: parsed, actors: Array.from(parsed.allActors) }));
  }

  const changeSelectedActor = (i) => (event) => {
    if (event.target.checked && !selectedActors.has(i)) {
      let newSelectedActors = selectedActors;
      newSelectedActors.add(i)
      setSelectedActors(newSelectedActors)
      updateCueScript();
    } else if (!event.target.checked && selectedActors.has(i)) {
      let newSelectedActors = selectedActors;
      newSelectedActors.delete(i)
      setSelectedActors(newSelectedActors)
      updateCueScript();
    }
  }

  const checkboxes = state.actors.map((t, i) => <FormControlLabel control={<Checkbox onChange={changeSelectedActor(i)} />} label={t} />);

  useEffect(updateCueScript, [state, selectedActors]);

  return <div className="main-container flexcols">
    <div className="full-script flexrows flexkid">
      <div className="script-header flexkid white-back"><h2>Paste your script here.</h2></div>
      <div className="script-editor flexkid white-back">
        <EditableText text={state.text} onChange={onChangeScript} />
      </div>
      <div className="script-buttons flexkid flexcols white-back">
        <Button
          variant="outlined"
          size="large"
          color="primary"
          className="footer-button"
          endIcon={<AddIcon />}
          onClick={() => convertCueScript()}
        >
          Parse the Script
        </Button>
      </div>
    </div>
    {state.actors.length > 0 &&
      <div className="flexcols flexkid">
        <div className="cue-selector flexrows flexkid colblock white-back ">
          <div className="select-header "><h2>Choose the characters to use.</h2></div>
          <FormGroup>
            {checkboxes}
          </FormGroup>
          <div><h2># of words in cue</h2></div>
          <Slider
            aria-label="n words in cue"
            defaultValue={5}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={8}
            onChangeCommitted={(e, v) => {
              setState({ ...state, nWordsInCueScript: v as number})
            }}
          />
          <div><h2># of letters in a line</h2></div>
          <Slider
            aria-label="line length"
            defaultValue={70}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={30}
            max={100}
            onChangeCommitted={(e, v) => {
              setState({ ...state, nLettersInLine: v as number})
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
