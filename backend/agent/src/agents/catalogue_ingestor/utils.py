from .schemas import BBox

def get_pil_box(bbox: BBox, img_width: float, img_height: float):
    """Convert a BBox in 0-1000 scale to a PIL-compatible box tuple."""
    # 1. Convert from 0-1000 scale to 0-1 scale
    # 2. Multiply by actual pixel dimensions
    left = (bbox.xmin / 1000) * img_width
    top = (bbox.ymin / 1000) * img_height
    right = (bbox.xmax / 1000) * img_width
    bottom = (bbox.ymax / 1000) * img_height
    
    return (left, top, right, bottom)