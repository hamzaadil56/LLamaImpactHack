import os
import base64
from typing import Union
from datetime import datetime
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Function to encode an image from a file path to base64
def encode_image_from_path(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Main function to analyze an image using Groq's API
def check_for_dry_eyes(
        image_source: Union[str, bytes], 
        # date:datetime,
        api_key: str=GROQ_API_KEY,
        is_url: bool = True) -> str:
    
    if api_key:
        client = Groq(api_key=api_key)
    else:
        raise Exception("No API key provided")

    # Defining the image content for the API request
    if is_url:
        image_content = {
            "type": "image_url",
            "image_url": {"url": image_source},
        }
    else:
        # Encoding the local image to base64
        try:
            base64_image = encode_image_from_path(image_source)
            image_content = {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}",
                },
            }
        except:
            raise Exception("Something went wrong")

    # Sending the image to Groq API for analysis
    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.2-90b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": "Please look at the eye area and respond with 'Yes' if any dryness or fatigue is noticeable and 'No' if not."
                        },
                        image_content,
                    ],
                }
            ],
            temperature=0.2,
            max_tokens=256,
            # top_p=1,
            stream=False,
            stop=None,
        )
    except:
        raise Exception("Something went wrong")

    # Return the API response content
    return chat_completion.choices[0].message.content

