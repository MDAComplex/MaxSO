import struct, zlib

def create_png(size):
    w, h = size, size
    bg = (10, 10, 11)
    rows = []
    for _ in range(h):
        row = b'\x00' + bytes([bg[0], bg[1], bg[2]] * w)
        rows.append(row)
    raw = b''.join(rows)
    compressed = zlib.compress(raw)

    def chunk(name, data):
        c = name + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack('>I', len(data)) + c + struct.pack('>I', crc)

    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')

with open('public/icons/icon-192.png', 'wb') as f:
    f.write(create_png(192))
with open('public/icons/icon-512.png', 'wb') as f:
    f.write(create_png(512))
print('Icons generated')
