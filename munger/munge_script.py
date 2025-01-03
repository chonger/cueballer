from llama_cpp import Llama

# llm = Llama(
#       model_path="/home/pwnr/llama.cpp/Llama-3.1-8Bb/Llama-3.1-8.0B-8Bb-F16.gguf",
#       n_gpu_layers=-1, # Uncomment to use GPU acceleration
#       # seed=1337, # Uncomment to set a specific seed
#       n_ctx=2048, # Uncomment to increase the context window
# )

test_prompt = '''

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

full_prompt = test_prompt + script

import google.generativeai as genai
import os
genai.configure(api_key="AIzaSyDz4Wv3OOoaAP6TsN8Sax-0kd_N27ulhMw")

basepath = "data"
for f in os.listdir(basepath):
      with open(os.path.join(basepath, "rawscripts", f)) as f:
            script = f.read()
      
      model = genai.GenerativeModel("gemini-1.5-flash")
      response = model.generate_content(full_prompt)
      with open(os.path.join(basepath, "formatted", f), "w") as f:
            f.write(response.text)

# full_prompt = "How much wood would a woodchuck chuck if"

# print("PROMPT\n\n")
# print(full_prompt)
# print("\n\n")

# output = llm(
#       full_prompt, # Prompt
#       max_tokens=1024, # Generate up to 32 tokens, set to None to generate up to the end of the context window
#       stop=["I AM DONE"], # Stop generating just before the model would generate a new question
#       echo=False # Echo the prompt back in the output
# ) # Generate a completion, can also call create_completion

# print(output['choices'][0]['text'])