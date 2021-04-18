import TextField from '@material-ui/core/TextField'
import './CueballEditor.css'
import { useState } from 'react'
import { comedyerr } from './demo_data'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

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
    
    const [state, setState] = useState({text: comedyerr, cueScript: '', actors: [], parsedScript: null});

    const onChangeScript = s => setState((state) => ({...state, text: s}));
    const onChangeCueScript = s => setState((state) => ({...state, cueScript: s}));
    const handleChangeActor = s => {
      console.log("Chose actor ", s);

      let cscript = state.parsedScript['title'] + " - " + s + " CUE SCRIPT\n\n"

      for(let scene of state.parsedScript.scenes) {

        cscript += '\n\n' + scene.sceneName + '\n\n'

        let cue = ""

        for(let c of scene.content) {
          if(c.type === 'stage direction') {
            continue;
          }
          if(c.type == 'line' && c.actor == s) {
            cscript += cue + '\n\n' + c.text + '\n\n'
          }

          cue = "------------------- " + c.text.slice(-50).split(' ').slice(1).join(' ');
        }
        
      }

      setState((state) => ({...state, cueScript: cscript}))
    }

    const convertCueScript = () => {
      
      const text = state.text;

      const lines = text.split("\n");

      const data = {scenes: []};

      let currentScene = null;

      const actors = new Set();

      let linedx = 0;
      for(let line of lines) {
        linedx += 1
        if(line.indexOf("T:") === 0) {
          data['title'] = line.slice(2);
          continue;
        }

        if(line.indexOf("NS:") === 0) {
          const newScene = {
            sceneName: line.slice(3),
            content: []
          }
          currentScene = newScene;
          data['scenes'].push(currentScene);
          continue;
        }

        if(line.indexOf("SL:") === 0) {
          currentScene['location'] = line.slice(3)
          continue;
        }

        if(line.indexOf("SD:") === 0) {
          currentScene['content'].push({
            type: "stage direction",
            text: line.slice(3)
          }) 
          continue;
        }

        if(line.length === 0) {
          continue;
        }

        if(line.toUpperCase() === line) {
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

      setState((state) => ({...state, parsedScript: data, actors: [...actors]}));
    }

    return <div className="main-container flexcols">
      <div className="full-script flexrows flexkid">
        <div className="script-editor flexkid"> 
          <EditableText text={state.text} onChange={onChangeScript}/>
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
          Analyze
        </Button>
        </div>
      </div>
      <div className="cue-script flexrows  flexkid">
        <div className="cue-selector"> 
        <Select
          value={state.actors[0]}
          onChange={(e) => handleChangeActor(e.target.value)}
        >
          {state.actors.map((t, i) => (
            <MenuItem key={i.toString()} value={t}>{t}</MenuItem>
          ))}
        </Select>
        </div> 
        <div className="script-buttons flexcols flexkid">
          <EditableText text={state.cueScript} onChange={onChangeCueScript}/>
        </div>       
      </div>
    </div>
}