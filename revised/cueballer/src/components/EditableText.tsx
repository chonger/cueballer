import React from 'react';
import TextField from '@mui/material/TextField';
import '../styles/EditableText.css';

interface EditableTextProps {
  text: string;
  onChange: (value: string) => void;
}

const EditableText: React.FC<EditableTextProps> = ({ text, onChange }) => {
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
    />
  );
};

export default EditableText;
