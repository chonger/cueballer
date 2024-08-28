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
      id="cues"
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

  const [state, setState] = useState({ text: comedyerr, cueScript: '', actors: [], parsedScript: null, nWordsInCueScript: 5, nLettersInLine: 70 });
  const [selectedActors, setSelectedActors] = useState(new Set());

  const rightJustify = (s) => {
    return `${new Array(state.nLettersInLine - s.length).fill('-').join('')}${s}`
  }

  const centerJustify = (s) => {
    const len = Math.floor((state.nLettersInLine - s.length) / 2)
    if (len < 0)
      return s
    console.log("EN", { s, len })
    const spacer = new Array(len).fill(' ').join('')
    const optionalSpacer = spacer.length % 2 == 0 ? '' : ' '
    return `${spacer}${s}${spacer}${optionalSpacer}`
  }

  const onChangeScript = s => setState((state) => ({ ...state, text: s }));
  const onChangeCueScript = s => setState((state) => ({ ...state, cueScript: s }));
  const updateCueScript = () => {

    if (state.parsedScript == null) {
      return;
    }

    const curActors = new Set(state.actors.filter((a, i) => selectedActors.has(i)));

    let cscript = centerJustify(state.parsedScript['title'] + " - " + Array.from(curActors).join(" / ")) + "\n\n"

    for (let scene of state.parsedScript.scenes) {

      let hasLine = false
      for (let c of scene.content) {
        if (c.type == 'line' && curActors.has(c.actor)) {
          hasLine = true
        }
      }
      if (!hasLine) {
        continue
      }

      cscript += "\n" + centerJustify(scene.sceneName.trim()) + "\n"

      const makeCue = (c) => rightJustify( c.text.trim().split(' ').slice(-state.nWordsInCueScript).join(' ').replaceAll("\n", ' ').replaceAll("\r", ' '))

      let cue = ""
      let tmpCue = ""
      let myLine = ""
      let lastSD = ""
      let lastActor = ""
      for (let c of scene.content) {
        console.log("SOFAR", { c, cscript, cue, myLine, lastActor, curActors });
        if (c.type === 'stage direction') {
          lastSD += "\n" + centerJustify(`[${c.text}]`.trim()) + "\n"
          // stage directions are not used as cues!
        }
        else if (c.type == 'line') {
          if (c.actor === lastActor) { // continuing a line
            if(lastSD.length > 0) {
              myLine += lastSD
            }
            myLine += c.text.trim()
            tmpCue = makeCue(c)
          } else { // end previous line if it exists
            if (lastActor && myLine.length > 0) {
              cscript += cue.trim() + '\n' + myLine + '\n'
            }

            myLine = ""
            lastActor = c.actor
            cue = tmpCue

            if (curActors.has(c.actor)) { // start a new line
              myLine += c.text.trim()
            }
            
            //set cue
            tmpCue = makeCue(c)
          }
          lastSD = ""
        } else {
          console.log("NOTPROCESSING", c)
        }
      }

      if (myLine.length > 0) {
        cscript += cue.trim() + '\n' + myLine + '\n' // commit final line 
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

    let justEndedSD = false

    let linedx = 0;
    for (let line of lines) {
      linedx += 1
      let lastEndedSD = justEndedSD
      justEndedSD = false

      console.log(`READING LINE ${line}`)
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

      if (line.trim().length === 0) { // might be switching back to a actor from a SD....
        console.log(currentScene)
        if (currentScene && currentScene['content'].length > 0 && currentScene['content'].slice(-1)[0].type == 'stage direction') {
          console.log("HIT")
          justEndedSD = true
        }
        continue;
      }

      const pruned = line.replaceAll('and', '').trim()

      if (pruned.length > 0 && pruned.toUpperCase() === pruned) {
        currentScene['content'].push({
          type: "line",
          actor: line,
          text: ''
        })
        actors.add(line);
        continue;
      }

      if (lastEndedSD) {
        console.log("GOT IT!")
        const lastActor = currentScene['content'].slice(-2)[0].actor

        currentScene['content'].push({
          type: "line",
          actor: lastActor,
          text: ''
        })
      }

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
            max={8}
            onChangeCommitted={(e, v) => {
              setState({ ...state, nWordsInCueScript: v })
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
              setState({ ...state, nLettersInLine: v })
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