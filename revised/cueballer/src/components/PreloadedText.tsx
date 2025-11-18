import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { parseScript } from '../munging';
import AppContent from './AppContent';
import { INIT_STATE, MyState } from '../stateTypes';

const PreloadedText: React.FC = () => {
  const { textName } = useParams();
  const [state, setState] = useState<MyState>(INIT_STATE);

  useEffect(() => {
    const loadText = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/texts/${textName}`);
        if (!response.ok) throw new Error('Text not found');
        const content = await response.text();
        setState((prevState: MyState) => ({
          ...prevState,
          originalScript: content,
          fileName: textName || null
        }));
        const parsed = parseScript(content);
        setState((prevState: MyState) => ({
          ...prevState,
          parsedScript: parsed,
          selectedCharacters: new Set<string>()
        }));
      } catch (error) {
        console.error('Error loading text:', error);
      }
    };
    if (textName) loadText();
  }, [textName]);

  return <AppContent state={state} setState={setState} />;
};

export default PreloadedText;
