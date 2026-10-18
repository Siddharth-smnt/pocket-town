"""Install the exact CI artifact and exercise its visible native/WebView UI with adb."""
import json
import hashlib
from pathlib import Path
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

folder = Path(sys.argv[1])
out = Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
meta = json.loads((folder / 'APK-INFO.json').read_text())
package = meta['package']

def adb(*args, binary=False):
    result = subprocess.run(['adb', *args], check=True, capture_output=True, timeout=45)
    return result.stdout if binary else result.stdout.decode(errors='replace')

def screenshot(name):
    (out / f'{name}.png').write_bytes(adb('exec-out', 'screencap', '-p', binary=True))

def tree():
    adb('shell', 'uiautomator', 'dump', '/sdcard/pocket-town-window.xml')
    xml = adb('exec-out', 'cat', '/sdcard/pocket-town-window.xml')
    (out / 'last-window.xml').write_text(xml)
    return ET.fromstring(xml)

def values(node):
    return [node.get('text', ''), node.get('content-desc', '')]

def wait_for(label):
    deadline = time.monotonic() + 45
    while time.monotonic() < deadline:
        try:
            current = tree()
            for node in current.iter('node'):
                if any(label in value for value in values(node)):
                    return current, node
        except (ET.ParseError, subprocess.CalledProcessError):
            pass
        time.sleep(1)
    raise AssertionError(f'Visible UI did not reach: {label}')

def tap(label):
    _, node = wait_for(label)
    x1, y1, x2, y2 = map(int, re.findall(r'\d+', node.get('bounds', '')))
    adb('shell', 'input', 'tap', str((x1+x2)//2), str((y1+y2)//2))

def no_title_bar(current):
    bad = [n.get('resource-id', '') for n in current.iter('node')
           if re.search(r':id/(action_bar|action_bar_container|title_container)$', n.get('resource-id', ''))]
    if bad:
        raise AssertionError(f'Unexpected native title bar: {bad}')

def launch():
    adb('shell', 'am', 'start', '-W', '-n', package + '/com.siddharthsmnt.pockettown.dev.MainActivity')

try:
    apk = folder / meta['filename']
    if hashlib.sha256(apk.read_bytes()).hexdigest() != meta['sha256']:
        raise AssertionError('Downloaded APK checksum does not match artifact metadata')
    adb('install', '-r', str(apk))
    info = adb('shell', 'dumpsys', 'package', package)
    (out / 'installed-package.txt').write_text(info)
    if f"versionName={meta['version']}" not in info:
        raise AssertionError('Installed APK version does not match artifact')
    launch()
    current, _ = wait_for('Make yourself at home.')
    no_title_bar(current)
    wait_for('Version ' + meta['version'])
    screenshot('01-home')
    tap('Play puzzle')
    current, _ = wait_for('The little puzzle')
    no_title_bar(current)
    screenshot('02-puzzle')
    tap('Pause game')
    wait_for('A little breather.')
    screenshot('03-pause')
    adb('shell', 'input', 'keyevent', '4')
    current, _ = wait_for('The little puzzle')
    if any('A little breather.' in v for n in current.iter('node') for v in values(n)):
        raise AssertionError('Android Back did not close the pause menu')
    adb('shell', 'input', 'keyevent', '4')
    wait_for('Make yourself at home.')
    adb('shell', 'am', 'force-stop', package)
    launch()
    current, _ = wait_for('Make yourself at home.')
    no_title_bar(current)
    screenshot('04-relaunch-home')
    (out / 'result.json').write_text(json.dumps({'passed': True, 'artifact': meta,
        'checks': ['installed version', 'home screen', 'no native title bar', 'puzzle screen', 'pause', 'Android Back', 'cold relaunch']}, indent=2))
    print('PASS: exact APK opens Home, enters puzzle, closes pause/returns Home with Android Back, and relaunches without a native title bar')
finally:
    screenshot('last-screen')
    (out / 'logcat.txt').write_text(adb('logcat', '-d', '-t', '1200'))
