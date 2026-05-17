import os
from PIL import Image

def make_square(img, fill_color=(0, 0, 0, 0)):
    """Pads a non-square image into a square with transparent or solid background, centering it."""
    width, height = img.size
    if width == height:
        return img
    
    max_dim = max(width, height)
    new_img = Image.new("RGBA", (max_dim, max_dim), fill_color)
    
    # Calculate offset to center the image
    offset_x = (max_dim - width) // 2
    offset_y = (max_dim - height) // 2
    
    if img.mode == "RGBA" and fill_color[3] == 0:
        new_img.paste(img, (offset_x, offset_y), img)
    else:
        new_img.paste(img, (offset_x, offset_y))
        
    return new_img

def create_pwa_icons():
    web_dir = r"c:\Hackathon\superpay\web"
    public_dir = os.path.join(web_dir, "public")
    
    logo_path = os.path.join(public_dir, "logo.png")
    favicon_path = os.path.join(public_dir, "favicon.png")
    
    # Choose base image
    base_image_path = favicon_path if os.path.exists(favicon_path) else logo_path
    if not os.path.exists(base_image_path):
        print(f"Error: Base image not found at {base_image_path}")
        return
        
    print(f"Using base image: {base_image_path}")
    img = Image.open(base_image_path)
    print(f"Original size: {img.size}, Mode: {img.mode}")
    
    # Standard PWA icons: padded to square (transparent) and then resized
    square_img_transparent = make_square(img, fill_color=(0, 0, 0, 0))
    
    sizes = [192, 512]
    for size in sizes:
        # Resize
        resized_img = square_img_transparent.resize((size, size), Image.Resampling.LANCZOS)
        out_path = os.path.join(public_dir, f"icon-{size}x{size}.png")
        resized_img.save(out_path, "PNG")
        print(f"Created standard square icon: {out_path} ({resized_img.size})")
        
    # Maskable PWA icons (Android adaptive icons):
    # Padded to square first, and then paste inside a dark theme background with proper padding (safe zone)
    # The logo should occupy ~60% of the center area.
    for size in sizes:
        maskable_img = Image.new("RGBA", (size, size), (5, 5, 5, 255)) # Dark theme background #050505
        
        # We resize the square logo to 60% of the icon size
        logo_size = int(size * 0.6)
        logo_resized = square_img_transparent.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Paste in the center
        offset = (size - logo_size) // 2
        
        if logo_resized.mode == "RGBA":
            maskable_img.paste(logo_resized, (offset, offset), logo_resized)
        else:
            maskable_img.paste(logo_resized, (offset, offset))
            
        out_path = os.path.join(public_dir, f"icon-maskable-{size}x{size}.png")
        maskable_img.save(out_path, "PNG")
        print(f"Created maskable icon: {out_path} ({maskable_img.size})")

if __name__ == "__main__":
    create_pwa_icons()
