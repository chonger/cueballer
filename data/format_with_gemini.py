prompt = '''

You will reformat the text script to match some simple rules.

To begin the scene, you will give line that reads

NS: Act X Scene Y

where X is the Act number and Y is the Scene number.  

When there is a stage direction, you format it in a line like "SD: " followed by the stage direction

When a character is named in a stage direction, you will write their name in all capital letters.

If an actor is named in the stage direction, you will write their name in all capital letters, and place "+" at the beginning of their name.

If a character speaks lines in a scene you will write their name in all capital letters when they are named in stage directions.

If an actor is named between parenthesis with just the word "To, as "(To x)" where x is the actor's name , you will capitalize only the first letter of their name.

you will recognize verse lines because they always begin with a capital letter.

When a stage direction begins with "He" replace "He" with the name of whichever actor last spoke.

When a stage direction begins with "She" replace "She" with the name of whichever actor last spoke.

When a stage direction begins with "They" replace "They" with the name of whichever actor last spoke.

When multiple stage directions occur in succesion, with no speech between them, combine them into one stage direction on one line.

you will replace all parenthesis with brackets.

If the stage direction "Exit" follows an actor's line, you will write their name at the start of the stage direction, as "X exits", where X is the name of the actor.

When an actor speaks you will write their name in all caps and place "+" at the beginning of their name, beginning their line on the next line.  You may use multiple newlines for a single actor's line, but you may not insert blank lines.

If a line is said by "All" actors, then write the names of all the actors in the scene before the line, with ", " in between.

If the actor is speaking in verse, preserve line breaks.

If the actor is speaking in prose, ignore line breaks.

When there is a stage direction "Exuent", you will write the names of each actor in the the scene after it, as "Exuent X, Y, Z" where X, Y, and Z are the names of the actors in the scene, unless that actor has more lines later in the scene, or they have already exited.

Here is an example of correctly formatted output.

NS: Act 1, Scene 1

SD: Enter the DUKE of Ephesus with EGEON the merchant of Syracuse, JAILER with Officers, and other Attendants.

+EGEON
Proceed, Solinus, to procure my fall,
And by the doom of death end woes and all.

+SOLINUS, DUKE OF EPHESUS
Merchant of Syracuse, plead no more.
I am not partial to infringe our laws;
The enmity and discord which of late
Sprung from the rancorous outrage of your Duke
To merchants, our well-dealing countrymen,
Who, wanting guilders to redeem their lives,
Have seal’d his rigorous statutes with their bloods,
Excludes all pity from our threat’ning looks:
For since the mortal and intestine jars
’Twixt thy seditious countrymen and us,
It hath in solemn synods been decreed,
Both by the Syracusians and ourselves,
To admit no traffic to our adverse towns:
Nay more, if any born at Ephesus be seen
At any Syracusian marts and fairs;
Again, if any Syracusian born
Come to the bay of Ephesus, he dies,
His goods confiscate to the Duke’s dispose,
Unless a thousand marks be levied
To quit the penalty and to ransom him.
Thy substance, valued at the highest rate,
Cannot amount unto a hundred marks,
Therefore by law thou art condemn’d to die.

+EGEON
Yet this my comfort, when your words are done,
My woes end likewise with the evening sun.

+SOLINUS, DUKE OF EPHESUS
Well, Syracusian; say in brief the cause
Why thou departedst from thy native home,
And for what cause thou cam’st to Ephesus.

What follows next is the script that must be reformatted.

'''.strip() + "\n"

from google import genai
import os

from dotenv import load_dotenv
load_dotenv()

import tiktoken

import time

def estimate_gemini_tokens(text):
    """Estimates the number of tokens a text will use with Gemini.

    Args:
        text: The input text.

    Returns:
        The estimated number of tokens.  Returns -1 if encoding fails.
    """
    try:
      # Gemini uses the 'cl100k_base' encoding.
      encoding = tiktoken.get_encoding("cl100k_base")
      token_integers = encoding.encode(text) # Encode to integers
      num_tokens = len(token_integers)
      return num_tokens
    except Exception as e: # Catch potential encoding errors
        print(f"Error during encoding: {e}")
        return -1
    
client = genai.Client(api_key=os.getenv('GEMINI_KEY'))

basepath = "data"
raw_scripts = os.path.join(basepath, "raw_scripts")
for fname in os.listdir(raw_scripts):
    path = os.path.join(raw_scripts, fname)
    if not os.path.isfile(path):
        continue
    with open(path) as f:
        t = time.perf_counter()
        script = f.read()
        print("Processing", path, " -- estimated tokens:", estimate_gemini_tokens(prompt + script))
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=prompt + script
        )
        usage = response.usage_metadata
        print(f"USAGE:\n\n{usage}\n\n")
        with open(os.path.join(basepath, "formatted", fname), "w") as fout:
            fout.write(response.text)
        print(f"TIME: {time.perf_counter()-t}")
    break