"""Run/read the read-only hosting diagnostic using the existing Git login."""
import json
import subprocess
import sys
import urllib.request
import urllib.error
import io
import zipfile

credential = subprocess.run(['git', 'credential', 'fill'], input='protocol=https\nhost=github.com\n\n', text=True, capture_output=True, check=True)
values = dict(line.split('=', 1) for line in credential.stdout.splitlines() if '=' in line)
base = 'https://api.github.com/repos/zorali-33/cncpioneer-astro'
headers = {'Authorization': 'Bearer '+values['password'], 'Accept': 'application/vnd.github+json', 'User-Agent': 'CNCPioneer-Hosting-Diagnostic', 'X-GitHub-Api-Version': '2022-11-28'}
op = sys.argv[1]
if op == 'dispatch':
    request = urllib.request.Request(base+'/actions/workflows/diagnose-hostinger.yml/dispatches', data=json.dumps({'ref': 'main'}).encode(), headers=headers, method='POST')
elif op == 'logs':
    request = urllib.request.Request(base+'/actions/runs/'+sys.argv[2]+'/logs', headers=headers)
else:
    request = urllib.request.Request(base+'/actions/workflows/diagnose-hostinger.yml/runs?per_page=1', headers=headers)
try:
    with urllib.request.urlopen(request, timeout=30) as response:
        data = response.read()
        if op == 'logs':
            archive = zipfile.ZipFile(io.BytesIO(data))
            for filename in archive.namelist():
                if 'Inspect hosting' in filename:
                    content = archive.read(filename).decode('utf-8')
                    # The job prints only selected config directives and statuses.
                    start = content.find('"folder":')
                    print(content[max(0, start-60):] if start >= 0 else content[-8000:])
        elif op == 'status':
            runs = json.loads(data)['workflow_runs']
            print(json.dumps([{key:r.get(key) for key in ['id','status','conclusion','html_url']} for r in runs]))
        else:
            print('Diagnostic dispatch status:', response.status)
except urllib.error.HTTPError as error:
    print('GitHub API error:', error.code)
    sys.exit(1)
