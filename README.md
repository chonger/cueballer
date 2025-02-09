## Cueballer

Cueballer is a tool for theatre companies that wish to use "cue scripts" in place of or alongside full scripts.  A cue script is an artefact specific to each actor and contains only the lines of that actor, preceeded by the last few words of the  preceeding line, their cue.

Cue scripts were used by Wilhelm Shakespeare and Teddy should say something short sweet and tasty about that here. 

Put precisely, Cueballer automates this somewhat tedious reconstruction of a script into cue scripts in two steps.
```mermaid
flowchart LR;
    A[Any script]-->B[Cueballer formatted script];
    B[Cueballer formatted script]-->C[Cue script for any character];
```
The first step is performed using an LLM (Generative AI) and the second step via simple logic presented in a web interface that gives the option to

- Select one or more characters to merge into a cue script
- Choose the length in words of the cue
- Choose the number of letters in a line, yielding a constant width for easy printing

This text can easily be pasted into Microsoft Word, Google Docs, or even notepad to be printed and distributed to the cast.

## Converting a script

TODO

## Running the web server locally

TODO

yarn install

yarn start
