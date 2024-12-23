prompt = '''

You will reformat the text script to match some simple rules.

To begin the scene, you will give line that reads

NS: Act X Scene Y

where X is the Act number and Y is the Scene number.  

If there is a description of the location of the scene, you will follow this with a line beginning with "SL: " followed by the scene locations.

When there is a stage direction, you format it in a line like "SD: " followed by the stage direction

When an actor speaks you will write their name in all caps, beginning their line on the next line.  You may use multiple newlines for a single actor's line, but you may not insert blank lines.

Here is an example of correctly formatted output.

NS: Act 1, Scene 1

SL: A hall in Duke Solinus’s Palace.

SD: Enter the Duke of Ephesus with Egeon the merchant of Syracuse, Jailer with Officers, and other Attendants.

EGEON
Proceed, Solinus, to procure my fall,
And by the doom of death end woes and all.

SOLINUS, DUKE OF EPHESUS
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

EGEON
Yet this my comfort, when your words are done,
My woes end likewise with the evening sun.

SOLINUS, DUKE OF EPHESUS
Well, Syracusian; say in brief the cause
Why thou departedst from thy native home,
And for what cause thou cam’st to Ephesus.

What follows next is the script that must be reformatted.

'''.strip() + "\n"

import google.generativeai as genai
import os
from dotenv import load_dotenv
load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_KEY'))
model = genai.GenerativeModel("gemini-1.5-flash")

basepath = "data"
raw_scripts = os.path.join(basepath, "raw_scripts")
for fname in os.listdir(raw_scripts):
    with open(os.path.join(raw_scripts, fname)) as f:
        script = f.read()  
        response = model.generate_content(prompt + script)
        with open(os.path.join(basepath, "formatted", fname), "w") as fout:
            fout.write(response.text)
