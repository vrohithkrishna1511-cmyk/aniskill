import sys
from PIL import Image

def remove_white_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    queue = []
    
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        
    for item in queue:
        visited.add(item)
        
    def is_whitish(r, g, b, a):
        # Tolerate near-white pixels
        return r > 230 and g > 230 and b > 230
        
    head = 0
    while head < len(queue):
        cx, cy = queue[head]
        head += 1
        
        r, g, b, a = pixels[cx, cy]
        if is_whitish(r, g, b, a):
            pixels[cx, cy] = (0, 0, 0, 0)
            
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
        print("Usage: python process_image_white.py <input> <output>")
        sys.exit(1)
    remove_white_bg(sys.argv[1], sys.argv[2])
