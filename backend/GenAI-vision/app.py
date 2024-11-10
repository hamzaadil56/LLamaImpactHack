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
    """
    Encodes a local image file to a base64 string.

    Parameters:
    ----------
    image_path : str
        The file path of the image to be encoded.

    Returns:
    -------
    str
        A base64-encoded string representing the image.

    Raises:
    ------
    FileNotFoundError
        If the specified file does not exist.
    IOError
        If an error occurs during file reading.
    """
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except FileNotFoundError:
        raise FileNotFoundError("The specified image file was not found.")
    except Exception as e:
        raise Exception(f"Error encoding image: {e}")

# Main function to analyze an image using Groq's API
def check_for_dry_eyes(
        image_source: Union[str, bytes], 
        # date:datetime,
        api_key: str=GROQ_API_KEY,
        is_url: bool = True) -> str:
    
    """
    Analyzes an image for signs of dry eyes using the Groq API.

    Parameters:
    ----------
    image_source : Union[str, bytes]
        The image input; can be a URL (str) if `is_url` is True, or a file path (str) if `is_url` is False.
    api_key : str, optional
        The API key for Groq authentication, defaulting to the `GROQ_API_KEY` environment variable.
    is_url : bool, optional
        Determines if `image_source` is a URL (True) or a local file path (False).

    Returns:
    -------
    str
        The Groq API's response, ideally a Yes/No assessment of dry-eye symptoms.

    Raises:
    ------
    ValueError
        If the `api_key` is missing.
    FileNotFoundError
        If a specified file for local image encoding does not exist.
    IOError
        For general issues with file access.
    Exception
        For any API communication errors or unexpected issues.
    """
    
    if not api_key:
        raise ValueError("API key is missing. Ensure GROQ_API_KEY is set.")

    client = Groq(api_key=api_key)

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
        except Exception as e:
            raise Exception(f"Failed to process image from path: {e}")

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
    except ConnectionError:
        raise ConnectionError("Failed to connect to the Groq API. Check your network.")
    except Exception as e:
        raise Exception(f"API request failed: {e}")

    # Returning the API response content
    try:
        response_content = chat_completion.choices[0].message.content
    except (IndexError, AttributeError) as e:
        raise ValueError(f"Unexpected API response structure: {e}")

    return response_content

# # test
# result = check_for_dry_eyes(
#     image_source="https://thumbs.dreamstime.com/b/human-face-isolated-white-background-spa-portrait-beautiful-fresh-healthy-woman-beauty-close-up-portrait-beautiful-126143418.jpg",
#     is_url=True                            
# )

# print(result)