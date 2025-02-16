import socket
import threading
import sounddevice as sd
import time
import pickle
import struct

# Configuration
HOST = '0.0.0.0'
PORT = 5000
CHUNK = 18432  # Size of each audio chunk
FORMAT = 'int16'  # Audio format compatible with sounddevice
CHANNELS = 1  # Number of audio channels
RATE = 44100  # Sample rate (Hz)
DELAY = 0.5  # 500ms delay for synchronization

clients = []
clients_lock = threading.Lock()

def audio_callback(indata, frames, time_info, status):
    """Callback function that processes audio input and broadcasts to all clients."""
    if status:
        print(f"Status error: {status}")
        return

    with clients_lock:
        timestamp = time.time() + DELAY
        packet = pickle.dumps((timestamp, indata.tobytes()))
        packet_length = struct.pack('>I', len(packet))
        
        for client in clients:
            try:
                client.sendall(packet_length + packet)
            except (BrokenPipeError, ConnectionResetError):
                print(f'Removing client due to disconnection.')
                clients.remove(client)

def start_audio_stream():
    """Start capturing system output audio."""
    stream = sd.InputStream(callback=audio_callback,
                            channels=CHANNELS,
                            samplerate=RATE,
                            dtype=FORMAT,
                            blocksize=CHUNK)
    stream.start()
    print("Audio stream started. Capturing system output...")

def handle_client(conn, addr):
    """Handles client connection."""
    print(f'New connection from {addr}')
    with clients_lock:
        clients.append(conn)

    try:
        while True:
            conn.recv(1)  # Keep connection alive
    except Exception as e:
        print(f'Client {addr} disconnected: {e}')
    finally:
        with clients_lock:
            clients.remove(conn)
        conn.close()

def start_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((HOST, PORT))
    server.listen()
    print(f'Server listening on {HOST}:{PORT}')

    # Start the audio capture stream
    threading.Thread(target=start_audio_stream, daemon=True).start()

    while True:
        conn, addr = server.accept()
        client_thread = threading.Thread(target=handle_client, args=(conn, addr), daemon=True)
        client_thread.start()

if __name__ == '__main__':
    start_server()
