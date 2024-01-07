import TextField from '@material-ui/core/TextField'
import './CueballEditor.css'
import { useState, useEffect } from 'react'
import { comedyerr } from './demo_data'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import Checkbox from '@material-ui/core/Checkbox';
import { FormControlLabel, FormGroup, Slider } from '@material-ui/core'

export const EditableText = ({
  text,
  onChange,
}) => {
  return (
    <TextField
      className={'small-text-input'}
      autoComplete="off"
      placeholder="empty"
      value={text}
      multiline
      rows={30}
      variant="outlined"
      fullWidth
      onChange={e => onChange(e.target.value)}
    ></TextField>
  )
}

export const CueballEditor = () => {

  const [state, setState] = useState({ text: comedyerr, cueScript: '', actors: [], parsedScript: null, nWordsInCueScript: 5 });
  const [selectedActors, setSelectedActors] = useState(new Set());

  const onChangeScript = s => setState((state) => ({ ...state, text: s }));
  const onChangeCueScript = s => setState((state) => ({ ...state, cueScript: s }));
  const updateCueScript = () => {

    if (state.parsedScript == null) {
      return;
    }

    const curActors = new Set(state.actors.filter((a, i) => selectedActors.has(i)));

    let cscript = state.parsedScript['title'] + " - " + Array.from(curActors).join(" / ") + "\n\n"

    for (let scene of state.parsedScript.scenes) {

      cscript += '\n\n' + scene.sceneName + '\n\n'

      let cue = ""

      for (let c of scene.content) {
        if (c.type === 'stage direction') {
          continue;
        }
        if (c.type == 'line' && curActors.has(c.actor)) {
          cscript += cue + '\n\n' + c.text + '\n\n'
        }

        cue = "------------------- " + c.text.split(' ').slice(-state.nWordsInCueScript).join(' ');
        // console.log("OK", { n: state.nWordsInCueScript, t: c.text.split(' '), cue })
      }
    }

    console.log("UPDATING CUE SCRIPT")
    if (cscript != state.cueScript) {
      setState((state) => ({ ...state, cueScript: cscript }))
    }
  }

  const convertCueScript = () => {

    const text = state.text;

    const lines = text.split("\n");

    const data = { scenes: [] };

    let currentScene = null;

    const actors = new Set();

    let linedx = 0;
    for (let line of lines) {
      linedx += 1
      if (line.indexOf("T:") === 0) {
        data['title'] = line.slice(2);
        continue;
      }

      if (line.indexOf("NS:") === 0) {
        const newScene = {
          sceneName: line.slice(3),
          content: []
        }
        currentScene = newScene;
        data['scenes'].push(currentScene);
        continue;
      }

      if (line.indexOf("SL:") === 0) {
        currentScene['location'] = line.slice(3)
        continue;
      }

      if (line.indexOf("SD:") === 0) {
        currentScene['content'].push({
          type: "stage direction",
          text: line.slice(3)
        })
        continue;
      }

      if (line.length === 0) {
        continue;
      }

      if (line.toUpperCase() === line) {
        currentScene['content'].push({
          type: "line",
          actor: line,
          text: ''
        })
        actors.add(line);
        continue;
      }

      // line is non-empty and continuing a SD or line
      currentScene['content'].slice(-1)[0].text += "\n" + line
    }

    console.log("PARSED SCRIPT", data);

    setState((state) => ({ ...state, parsedScript: data, actors: [...actors] }));
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

  useEffect(updateCueScript, [state]);

  return <div className="main-container flexcols">
    <div className="full-script flexrows flexkid">
      <div className="script-header "><h2>Paste your script here.</h2></div>
      <div className="script-editor ">
        <EditableText text={state.text} onChange={onChangeScript} />
      </div>
      <div className="script-buttons flexcols">
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
        <div className="cue-selector flexrows">
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
            max={30}
            onChangeCommitted={(e, v) => {
              setState({ ...state, nWordsInCueScript: v })
            }}
          />
        </div>
        <div className="cue-script flexrows flexkid">
          <div className="script-buttons flexcols flexkid">
            <EditableText text={state.cueScript} onChange={onChangeCueScript} />
          </div>
        </div>
      </div>
    }
  </div>
}