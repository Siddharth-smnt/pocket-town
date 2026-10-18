"""Verify the actual APK payload, then give downloads an unambiguous versioned name."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from zipfile import ZipFile

root = Path(__file__).resolve().parent.parent
mode = sys.argv[1]
if mode not in {'debug', 'preview', 'test-ads'}:
    raise SystemExit('Expected debug, preview or test-ads')
version = json.loads((root / 'package.json').read_text())['version']
apk = root / 'android/app/build/outputs/apk/debug/app-debug.apk'
commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
with ZipFile(apk) as package:
    for asset in (root / 'dist').rglob('*'):
        if asset.is_file():
            name = 'assets/public/' + asset.relative_to(root / 'dist').as_posix()
            if package.read(name) != asset.read_bytes():
                raise SystemExit(f'Stale packaged web asset: {name}')
    html = package.read('assets/public/index.html').decode()
    for marker in ['id="home-screen"', 'id="game-screen"', 'Make yourself at home.', 'data-build-version']:
        if marker not in html:
            raise SystemExit(f'Missing current UI marker: {marker}')
    config = json.loads(package.read('assets/capacitor.config.json'))
    if config.get('server', {}).get('url'):
        raise SystemExit('Debug delivery must use packaged assets, not a remote server')
sdk = Path(os.environ['ANDROID_HOME'])
aapt = sdk / 'build-tools/36.0.0/aapt'
badging = subprocess.check_output([str(aapt), 'dump', 'badging', str(apk)], text=True)
if f"versionName='{version}'" not in badging:
    raise SystemExit('Native and web versions disagree')
package_id = re.search(r"package: name='([^']+)'", badging).group(1)
expected_id = 'com.siddharthsmnt.pockettown.dev' + ('.preview' if mode == 'preview' else '')
if package_id != expected_id or config['appId'] != package_id:
    raise SystemExit('Native and Capacitor package IDs do not match the requested build mode')
out = root / 'artifacts/apk'
out.mkdir(parents=True, exist_ok=True)
name = f'Pocket-Town-{version}-{mode}.apk'
shutil.copyfile(apk, out / name)
checksum = hashlib.sha256(apk.read_bytes()).hexdigest()
(out / 'SHA256SUMS.txt').write_text(f'{checksum}  {name}\n')
(out / 'COMMIT.txt').write_text(commit + '\n')
(out / 'APK-INFO.json').write_text(json.dumps({
    'version': version, 'package': package_id, 'mode': mode,
    'commit': commit, 'sha256': checksum, 'filename': name,
    'packaged_web_assets_match_build': True,
}, indent=2) + '\n')
print(f'Verified {name}: native version and bundled Home/Game screens match this commit')
