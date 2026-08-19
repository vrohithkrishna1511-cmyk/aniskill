import sys
from PIL import Image, ImageDraw

def remove_black_bg(input_path, output_path):
    # Open the image and ensure it has an alpha channel
    img = Image.open(input_path).convert("RGBA")
    
    # We want to flood fill the background. 
    # Since ImageDraw.floodfill fills with a specific color, we can fill with transparent.
    # However, PIL's floodfill doesn't support tolerance natively in a simple way for transparency if anti-aliased.
    # Let's do a simple BFS from the edges for pixels that are very dark (near black).
    
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    queue = []
    
    # Add border pixels to the queue
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        
    for item in queue:
        visited.add(item)
        
    def is_blackish(r, g, b, a):
        # Tolerate near-black pixels (due to compression artifacts)
        # Assuming black background is R<20, G<20, B<20
        return r < 30 and g < 30 and b < 30
        
    # BFS
    head = 0
    while head < len(queue):
        cx, cy = queue[head]
        head += 1
        
        r, g, b, a = pixels[cx, cy]
        if is_blackish(r, g, b, a):
            # Make it transparent
            pixels[cx, cy] = (0, 0, 0, 0)
            
            # Add neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    img.save(output_path, "PNG")
    print(f"Saved processed image to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python process_image.py <input> <output>")
        sys.exit(1)
    remove_black_bg(sys.argv[1], sys.argv[2])
