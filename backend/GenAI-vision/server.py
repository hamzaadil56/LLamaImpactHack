# Import FastAPI and relevant modules for handling HTTP requests and exceptions
from fastapi import FastAPI, UploadFile, Form, HTTPException
from app import check_for_dry_eyes  # Import the function from app.py for analyzing images
import os  # Import os for file operations

# Create an instance of the FastAPI app
app = FastAPI()

# Define a simple root endpoint that returns a welcome message
@app.get("/")
async def read_root():
    """
    GET /
    Endpoint for the root path that returns a simple welcome message.

    Returns:
    -------
    dict
        A JSON object with a welcome message.
    """
    return {"message": "Welcome to the FastAPI application!"}

# Define an endpoint for analyzing an image for dry eye detection
@app.post("/analyze-image/")
async def analyze_image(image: UploadFile, is_url: bool = Form(True)):
    """
    POST /analyze-image/
    Endpoint to analyze an image for signs of dry eyes.

    Parameters:
    ----------
    image : UploadFile
        The image file uploaded by the user.
    is_url : bool, optional
        A flag to indicate whether the image input is a URL (default is True).
    
    Returns:
    -------
    dict
        A JSON object containing the analysis result.
    
    Raises:
    ------
    HTTPException
        If there are errors in processing the image or analyzing it.
    """
    try:
        # If the image is provided as a URL, decode and process it directly
        if is_url:
            image_url = await image.read()
            response = check_for_dry_eyes(image_source=image_url.decode("utf-8"), is_url=True)
        else:
            # Save the uploaded image temporarily for local file processing
            file_path = f"temp_{image.filename}"
            with open(file_path, "wb") as f:
                f.write(await image.read())
            
            # Analyze the image from the local file path
            response = check_for_dry_eyes(image_source=file_path, is_url=False)
            
            # Remove the temporary file after processing
            os.remove(file_path)

        # Return the response received from the analysis function
        return {"result": response}
    
    # Handle HTTP exceptions and re-raise them
    except HTTPException as e:
        raise e
    
    # Catch any other exceptions and return a generic 500 Internal Server Error
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Instructions for running the FastAPI server:
# Use the following command in the terminal to start the server:
# uvicorn server:app --reload
