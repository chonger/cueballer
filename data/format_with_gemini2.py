prompt = '''

You will reformat the text script to match some simple rules.

You will differentiate between prose speeches and verse speeches

you will recognize verse speeches because all new lines in the speech begin with a capital letter.

you will recognize prose speeches because some of their new lines begin with lower case letters.

If a new line begins with a lower case letter, the speaker is speaking in prose.

Remove line breaks from all prose speeches.

Maintain all line breaks in verse speeches.

Here is an example of a verse speech:

+BRUTUS
Farewell to you, and you, and you Volumnius.	
Strato, thou hast bin all this while asleepe:	
Farewell to thee, to Strato, Countrymen:	
My heart doth ioy, that yet in all my life,	
I found no man, but he was true to me.	
I shall haue glory by this loosing day	
More then Octauius, and Marke Antony,	
By this vile Conquest shall attaine vnto.	
So fare you well at once, for Brutus tongue	
Hath almost ended his liues History:	
Night hangs vpon mine eyes, my Bones would rest,	
That haue but labour'd, to attaine this houre.	

Here is an example of a prose speech:

+CASKA
I can as well bee hang'd as tell the manner of it: It	
was meere Foolerie, I did not marke it. I sawe Marke Antony	
offer him a Crowne, yet 'twas not a Crowne neyther, 'twas	
one of these Coronets: and as I told you, hee put it by	
once: but for all that, to my thinking, he would faine haue	
had it. Then hee offered it to him againe: then hee put it by	
againe: but to my thinking, he was very loath to lay his	
fingers off it. And then he offered it the third time; hee	
put it the third time by, and still as hee refus'd it, the	
rabblement howted, and clapp'd their chopt hands,	
and threw vppe their sweatie Night-cappes, and vttered such	
a deale of stinking breath, because Casar refus'd the	
Crowne, that it had (almost) choaked Casar: for hee	
swoonded, and fell downe at it: And for mine owne part, I	
durst not laugh, for feare of opening my Lippes, and receyuing	
the bad Ayre.	



Here is an example of correctly formatted output.

+BRUTUS
Farewell to you, and you, and you Volumnius.	
Strato, thou hast bin all this while asleepe:	
Farewell to thee, to Strato, Countrymen:	
My heart doth ioy, that yet in all my life,	
I found no man, but he was true to me.	
I shall haue glory by this loosing day	
More then Octauius, and Marke Antony,	
By this vile Conquest shall attaine vnto.	
So fare you well at once, for Brutus tongue	
Hath almost ended his liues History:	
Night hangs vpon mine eyes, my Bones would rest,	
That haue but labour'd, to attaine this houre.	

+CASKA
I can as well bee hang'd as tell the manner of it: It was meere Foolerie, I did not marke it. I sawe Marke Antony offer him a Crowne, yet 'twas not a Crowne neyther, 'twas one of these Coronets: and as I told you, hee put it by once: but for all that, to my thinking, he would faine haue had it. Then hee offered it to him againe: then hee put it by againe: but to my thinking, he was very loath to lay his fingers off it. And then he offered it the third time; hee put it the third time by, and still as hee refus'd it, the rabblement howted, and clapp'd their chopt hands, and threw vppe their sweatie Night-cappes, and vttered such a deale of stinking breath, because Casar refus'd the Crowne, that it had (almost) choaked Casar: for hee swoonded, and fell downe at it: And for mine owne part, I durst not laugh, for feare of opening my Lippes, and receyuing the bad Ayre.	

What follows next is the script that must be reformatted.

'''.strip() + "\n"

import google.generativeai as genai
import os
from dotenv import load_dotenv
load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_KEY'))
model = genai.GenerativeModel("gemini-2.0-flash")

basepath = "data"
raw_scripts2 = os.path.join(basepath, "raw_scripts2")
for fname in os.listdir(raw_scripts2):
    with open(os.path.join(raw_scripts2, fname)) as f:
        print(fname)
        script = f.read()  
        response = model.generate_content(prompt + script)
        with open(os.path.join(basepath, "formatted2", fname), "w") as fout:
            fout.write(response.text)