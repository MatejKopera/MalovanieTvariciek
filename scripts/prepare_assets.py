"""Regenerate web media exclusively from the saved Figma assets.

This optional maintenance command requires Pillow, not a website build step.
The previous manually exported JPG files are no longer used.
"""
from pathlib import Path
import runpy

root=Path(__file__).resolve().parent
runpy.run_path(str(root/'prepare_figma_media.py'),run_name='__main__')
