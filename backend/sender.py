from pythonosc.udp_client import SimpleUDPClient
import sys
import os

print(os.environ, file=sys.stderr)

# Configuration for the destination host
ip = os.environ["MAX_OSC_IP"]
port = int(os.environ["MAX_OSC_TO_PORT"])

# Create an OSC client
client = SimpleUDPClient(ip, port)

# Define the OSC address and message
osc_address = sys.argv[1]  # The OSC address path
message = sys.argv[2]     # The message to send

# Send the message
client.send_message(osc_address, message)
print(f"Message '{message}' sent to {ip}:{port} with address '{osc_address}'")
