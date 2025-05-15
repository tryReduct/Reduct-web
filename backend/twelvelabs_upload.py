import os
import asyncio
from twelvelabs import TwelveLabs
from dotenv import load_dotenv
import logging
import cv2

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
API_KEY = os.getenv('TWELVELABS_API_KEY')
INDEX_ID = os.getenv('TWELVELABS_INDEX_ID')

# TwelveLabs duration requirements (in seconds)
MIN_DURATION = 4
MAX_DURATION = 7200  # 2 hours

# Initialize TwelveLabs client
client = TwelveLabs(api_key=API_KEY)

def get_video_duration(file_path):
    """
    Get the duration of a video file in seconds
    """
    try:
        video = cv2.VideoCapture(file_path)
        if not video.isOpened():
            logger.error(f"Could not open video file: {file_path}")
            return None
            
        # Get video properties
        fps = video.get(cv2.CAP_PROP_FPS)
        frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Calculate duration
        duration = frame_count / fps if fps > 0 else 0
        
        video.release()
        return duration
    except Exception as e:
        logger.error(f"Error getting video duration for {file_path}: {str(e)}")
        return None

def is_valid_duration(duration):
    """
    Check if the video duration meets TwelveLabs requirements
    """
    if duration is None:
        return False
    return MIN_DURATION <= duration <= MAX_DURATION

async def upload_file_to_twelvelabs(file_path):
    """
    Upload a single file to TwelveLabs index
    """
    try:
        # Check video duration before uploading
        duration = get_video_duration(file_path)
        if not is_valid_duration(duration):
            logger.warning(f"Skipping {file_path} - Duration {duration:.2f}s is outside allowed range ({MIN_DURATION}s to {MAX_DURATION}s)")
            return None

        # Create upload task
        task = client.task.create(
            index_id=INDEX_ID,
            file=file_path
        )
        
        # Wait for task to complete
        task.wait_for_done(sleep_interval=5, callback=lambda t: logger.info(f"Status: {t.status}"))
        
        if task.status != "ready":
            raise RuntimeError(f"Indexing failed with status {task.status}")
            
        logger.info(f"Successfully uploaded {file_path} to TwelveLabs")
        return task.video_id
        
    except Exception as e:
        logger.error(f"Error uploading {file_path} to TwelveLabs: {str(e)}")
        raise

async def process_uploads_directory():
    """
    Process all files in the uploads directory and upload them to TwelveLabs
    """
    uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    
    if not os.path.exists(uploads_dir):
        logger.warning("Uploads directory does not exist")
        return
        
    files = [f for f in os.listdir(uploads_dir) if os.path.isfile(os.path.join(uploads_dir, f))]
    
    if not files:
        logger.info("No files found in uploads directory")
        return
        
    for file in files:
        file_path = os.path.join(uploads_dir, file)
        try:
            await upload_file_to_twelvelabs(file_path)
            # Optionally remove the file after successful upload
            # os.remove(file_path)
        except Exception as e:
            logger.error(f"Failed to process {file}: {str(e)}")
            continue

def run_upload_process():
    """
    Run the upload process
    """
    asyncio.run(process_uploads_directory()) 