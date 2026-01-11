#!/usr/bin/env python3
"""
Image Cropping Utility - Maximum Size with Aspect Ratio
Crops an image into n sub-images, each using the maximum size possible
while maintaining the specified aspect ratio.

Example: For a 200x200 image with aspect ratio 10x10 (1:1), 
it will create a 200x200 crop.
"""

import os
import sys
from PIL import Image
import argparse
from pathlib import Path
import json


def parse_crop_dimensions(dimensions_str):
    """
    Parse crop dimensions from string format.
    Expected format: "WxH,WxH,WxH..." or JSON file path
    
    Args:
        dimensions_str: String with dimensions or path to JSON file
    
    Returns:
        List of tuples [(width, height), ...]
    """
    # Check if it's a JSON file path
    if dimensions_str.endswith('.json') and os.path.exists(dimensions_str):
        with open(dimensions_str, 'r') as f:
            data = json.load(f)
            return [(d['width'], d['height']) for d in data]
    
    # Parse comma-separated dimensions
    dimensions = []
    for dim in dimensions_str.split(','):
        dim = dim.strip()
        if 'x' in dim.lower():
            parts = dim.lower().split('x')
            width = int(parts[0].strip())
            height = int(parts[1].strip())
            dimensions.append((width, height))
    
    return dimensions


def calculate_grid_layout(n_crops, img_width, img_height, ratio_width, ratio_height):
    """
    Calculate the best grid layout (rows x cols) to fit n crops with given aspect ratio.
    
    Args:
        n_crops: Number of crops needed
        img_width: Width of the source image
        img_height: Height of the source image
        ratio_width: Width component of the aspect ratio
        ratio_height: Height component of the aspect ratio
    
    Returns:
        Tuple (rows, cols, crop_width, crop_height)
    """
    import math
    
    target_ratio = ratio_width / ratio_height
    best_layout = None
    max_crop_area = 0
    
    # Try different grid configurations
    for cols in range(1, n_crops + 1):
        rows = math.ceil(n_crops / cols)
        
        # Calculate crop size that fits in this grid
        cell_width = img_width // cols
        cell_height = img_height // rows
        cell_ratio = cell_width / cell_height
        
        # Determine crop size based on which dimension limits us
        if cell_ratio > target_ratio:
            # Cell is wider than needed, height is limiting
            crop_height = cell_height
            crop_width = int(crop_height * target_ratio)
        else:
            # Cell is taller than needed, width is limiting
            crop_width = cell_width
            crop_height = int(crop_width / target_ratio)
        
        crop_area = crop_width * crop_height
        
        # Keep track of the layout that gives the largest crops
        if crop_area > max_crop_area:
            max_crop_area = crop_area
            best_layout = (rows, cols, crop_width, crop_height)
    
    return best_layout


def calculate_optimal_positions(img_width, img_height, crop_dimensions):
    """
    Calculate optimal positions for non-overlapping crops with different aspect ratios.
    Uses a grid layout to ensure no overlap between crops.
    
    Args:
        img_width: Width of the source image
        img_height: Height of the source image
        crop_dimensions: List of (width, height) tuples representing aspect ratios
    
    Returns:
        List of tuples (x, y, width, height) representing crop boxes
    """
    import math
    
    positions = []
    n_crops = len(crop_dimensions)
    
    # Check if all dimensions are the same (uniform grid mode)
    if len(crop_dimensions) > 1 and len(set(crop_dimensions)) == 1:
        # All crops have the same aspect ratio - use optimized uniform grid
        ratio_width, ratio_height = crop_dimensions[0]
        
        rows, cols, crop_width, crop_height = calculate_grid_layout(
            n_crops, img_width, img_height, ratio_width, ratio_height
        )
        
        print(f"Grid layout: {rows} rows × {cols} columns")
        print(f"Each crop size: {crop_width}x{crop_height}")
        
        # Calculate positions in the grid
        cell_width = img_width // cols
        cell_height = img_height // rows
        
        crop_count = 0
        for row in range(rows):
            for col in range(cols):
                if crop_count >= n_crops:
                    break
                
                # Center the crop within each grid cell
                cell_x = col * cell_width
                cell_y = row * cell_height
                
                x = cell_x + (cell_width - crop_width) // 2
                y = cell_y + (cell_height - crop_height) // 2
                
                positions.append((x, y, crop_width, crop_height))
                crop_count += 1
    else:
        # Different aspect ratios - use adaptive grid layout
        print(f"Creating {n_crops} non-overlapping crops with different aspect ratios")
        
        # Determine grid layout
        cols = math.ceil(math.sqrt(n_crops))
        rows = math.ceil(n_crops / cols)
        
        cell_width = img_width // cols
        cell_height = img_height // rows
        
        print(f"Grid layout: {rows} rows × {cols} columns")
        print(f"Cell size: {cell_width}x{cell_height}")
        
        crop_count = 0
        for row in range(rows):
            for col in range(cols):
                if crop_count >= n_crops:
                    break
                
                ratio_width, ratio_height = crop_dimensions[crop_count]
                target_ratio = ratio_width / ratio_height
                cell_ratio = cell_width / cell_height
                
                # Calculate maximum crop size that fits in this cell
                if cell_ratio > target_ratio:
                    # Cell is wider, height is limiting
                    crop_height = cell_height
                    crop_width = int(crop_height * target_ratio)
                else:
                    # Cell is taller, width is limiting
                    crop_width = cell_width
                    crop_height = int(crop_width / target_ratio)
                
                # Center the crop within the cell
                cell_x = col * cell_width
                cell_y = row * cell_height
                
                x = cell_x + (cell_width - crop_width) // 2
                y = cell_y + (cell_height - crop_height) // 2
                
                positions.append((x, y, crop_width, crop_height))
                crop_count += 1
    
    return positions


def crop_image_custom(image_path, crop_dimensions, output_dir=None):
    """
    Crop an image into multiple sub-images with maximum size for each aspect ratio.
    
    The algorithm finds the largest possible crop from the source image that maintains
    the specified aspect ratio. For example, if you have a 200x200 image and specify
    10x10 (1:1 ratio), it will create a 200x200 crop.
    
    Args:
        image_path: Path to the source image
        crop_dimensions: List of (width, height) tuples representing aspect ratios
        output_dir: Directory to save cropped images (default: same as source)
    
    Returns:
        List of paths to the created sub-images
    """
    # Validate input
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    # Parse dimensions if string
    if isinstance(crop_dimensions, str):
        crop_dimensions = parse_crop_dimensions(crop_dimensions)
    
    if not crop_dimensions:
        raise ValueError("No valid crop dimensions provided")
    
    # Load the image
    try:
        img = Image.open(image_path)
    except Exception as e:
        raise Exception(f"Failed to open image: {e}")
    
    img_width, img_height = img.size
    print(f"Source image size: {img_width}x{img_height}")
    print(f"Number of aspect ratios: {len(crop_dimensions)}")
    
    # Setup output directory
    if output_dir is None:
        source_dir = os.path.dirname(image_path)
        output_dir = os.path.join(source_dir, 'cropped_images')
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Get base filename without extension
    base_name = Path(image_path).stem
    extension = Path(image_path).suffix
    
    # Calculate crop positions and sizes
    positions = calculate_optimal_positions(img_width, img_height, crop_dimensions)
    
    if not positions:
        raise ValueError("Cannot create any crops with the given aspect ratios.")
    
    print(f"Creating {len(positions)} maximum-size crops...")
    
    # Crop and save images
    created_files = []
    for idx, ((x, y, width, height), (ratio_w, ratio_h)) in enumerate(zip(positions, crop_dimensions), 1):
        cropped = img.crop((x, y, x + width, y + height))
        output_path = os.path.join(output_dir, f"{base_name}_crop_{idx:03d}{extension}")
        cropped.save(output_path)
        created_files.append(output_path)
        print(f"  Saved: {output_path} ({width}x{height} from ratio {ratio_w}:{ratio_h})")
    
    print(f"\nSuccessfully created {len(created_files)} cropped images!")
    return created_files


def main():
    parser = argparse.ArgumentParser(
        description='Crop an image into maximum size sub-images with specified aspect ratios',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Using comma-separated aspect ratios
  # For a 200x200 image with aspect ratio 10x10, creates a 200x200 crop
  %(prog)s image.jpg -d "10x10,16x9,1x1"
  
  # Multiple aspect ratios
  %(prog)s image.jpg -d "288x696,228x144,264x264,241x169,276x441"
  
  # Using JSON file
  %(prog)s image.jpg -d crops.json -o ./output/
  
  # JSON format example:
  [
    {"width": 10, "height": 10},
    {"width": 16, "height": 9},
    {"width": 1, "height": 1}
  ]
  
Note: The width and height values represent aspect ratios. The algorithm will
find the maximum size crop from the source image that maintains each ratio.
        """
    )
    
    parser.add_argument('image', help='Path to the source image')
    parser.add_argument('-d', '--dimensions', required=True,
                        help='Aspect ratios as "WxH,WxH,..." or JSON file path')
    parser.add_argument('-o', '--output', default=None,
                        help='Output directory (default: ./cropped_images/)')
    
    args = parser.parse_args()
    
    try:
        crop_image_custom(
            image_path=args.image,
            crop_dimensions=args.dimensions,
            output_dir=args.output
        )
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()