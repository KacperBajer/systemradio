import socket
import pyaudio
import pickle
import struct
import time

# Configuration
SERVER_IP = '192.168.208.50'  # Replace with your server's IP
PORT = 5000
CHUNK = 18432  # Audio chunk size
FORMAT = pyaudio.paInt16  # Audio format
CHANNELS = 1  # Number of audio channels (stereo)
RATE = 44100  # Sample rate (Hz)

# Initialize PyAudio
p = pyaudio.PyAudio()
stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, output=True, frames_per_buffer=CHUNK)

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((SERVER_IP, PORT))
print(f'Connected to server at {SERVER_IP}:{PORT}')

def receive_packet(sock):
    """Receive a complete packet from the server."""
    # Read the length of the packet (4 bytes)
    raw_length = sock.recv(4)
    if not raw_length:
        return None
    packet_length = struct.unpack('>I', raw_length)[0]

    # Receive the packet data
    data = b''
    while len(data) < packet_length:
        packet = sock.recv(packet_length - len(data))
        if not packet:
            return None
        data += packet

    return data

try:
    while True:
        packet = receive_packet(client_socket)
        if packet is None:
            break

        # Unpack the packet to get the timestamp and audio data
        timestamp, data = pickle.loads(packet)

        # Wait until the current time matches the timestamp
        current_time = time.time()
        time_to_wait = timestamp - current_time
        if time_to_wait > 0:
            time.sleep(time_to_wait)

        # Play the audio data
        stream.write(data)
except (ConnectionResetError, OSError) as e:
    print(f'Connection error: {e}')
finally:
    client_socket.close()
    stream.stop_stream()
    stream.close()
    p.terminate()
