import base64
import os

html_path = r'c:\Users\Erwin31\Desktop\Factura\factura_proveedor.html'
logo_path = r'c:\Users\Erwin31\Desktop\Factura\logo.jpg'

if not os.path.exists(logo_path):
    print(f"Error: {logo_path} not found.")
    exit(1)

if not os.path.exists(html_path):
    print(f"Error: {html_path} not found.")
    exit(1)

with open(logo_path, "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

base64_src = f"data:image/jpeg;base64,{encoded_string}"

with open(html_path, "r", encoding="utf-8") as html_file:
    html_content = html_file.read()

# Replace the src attribute
# Search for src="./logo.jpg"
old_tag = 'src="./logo.jpg"'
new_tag = f'src="{base64_src}"'

if old_tag in html_content:
    new_html_content = html_content.replace(old_tag, new_tag)
    with open(html_path, "w", encoding="utf-8") as html_file:
        html_file.write(new_html_content)
    print("Successfully embedded logo.")
else:
    print("Could not find src=\"./logo.jpg\" in HTML file.")


