#!/usr/bin/env python3
# Scratch voiceover (brief 7.3): espeak-ng Arabic, each line placed at its SRT in-time and fitted to its slot.
# Replace vo/vo-master.wav with the recorded Saudi voice before any public cut.
import re, subprocess, os, sys, json
root = os.path.join(os.path.dirname(__file__), '..')
N_SPOKEN = {24: 'أربعة وعشرين', 25: 'خمسة وعشرين'}
n = int(sys.argv[1]) if len(sys.argv) > 1 else 24
srt = open(os.path.join(root, 'emtithal-ask-the-code-subtitles-ar.srt'), encoding='utf8').read().replace('\r', '')
sec = lambda s: sum(float(x) * m for x, m in zip(re.split('[:,]', s), (3600, 60, 1, .001)))
cues = []
for b in srt.strip().split('\n\n'):
    l = b.split('\n'); a, z = [sec(x) for x in l[1].split(' --> ')]
    cues.append((int(l[0]), a, z, ' '.join(l[2:]).replace('{N}', N_SPOKEN.get(n, str(n)))))
tmp = os.path.join(root, 'build', 'vo'); os.makedirs(tmp, exist_ok=True); os.makedirs(os.path.join(root, 'vo'), exist_ok=True)
dur = lambda p: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))
ins, filt = [], []
for i, (k, a, z, text) in enumerate(cues):
    a = 0.25 if k == 1 else a           # the voice starts a quarter second after the first subtitle
    raw = f'{tmp}/l{k:02d}.wav'
    subprocess.check_call(['espeak-ng', '-v', 'ar', '-s', '195', '-p', '38', '-w', raw, text.replace('…', '،')])
    trim = raw.replace('.wav', 't.wav')
    subprocess.check_call(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', trim])
    raw = trim
    tempo = max(1.0, min(2.6, dur(raw) / (z - a - 0.03)))
    ins += ['-i', raw]
    filt.append(f'[{i}:a]atempo={tempo**0.5:.4f},atempo={tempo**0.5:.4f},aresample=48000,adelay={int(a*1000)}:all=1[a{i}]')
    print(k, f'{a:.2f}-{z:.2f}', f'tempo {tempo:.2f}', text)
filt.append(''.join(f'[a{i}]' for i in range(len(cues))) + f'amix=inputs={len(cues)}:normalize=0,apad=whole_dur=41,atrim=0:40[o]')
subprocess.check_call(['ffmpeg', '-y', '-v', 'error', *ins, '-filter_complex', ';'.join(filt), '-map', '[o]', '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s24le', os.path.join(root, 'vo', 'vo-master.wav')])
print('vo/vo-master.wav', dur(os.path.join(root, 'vo', 'vo-master.wav')))
