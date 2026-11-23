// Arabic shaping check (brief 14.1 rule 11): every subtitle and every product string at full size on one frame.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const root = path.join(__dirname, '..');
(async () => {
  require('child_process').execFileSync('node', [path.join(__dirname, 'build.cjs'), '--no-vo', '--out', path.join(root, 'build', 'tmp-' + process.pid + '.html')], { stdio: 'ignore' });
  const b = await chromium.launch(); const p = await b.newPage(); p.on('pageerror', (e) => console.error(e.message));
  await p.goto('file://' + path.join(root, 'build', 'tmp-' + process.pid + '.html')); await p.evaluate(() => { window.__render = true; return FILM.ready; });
  const img = await p.evaluate(() => {
    const L = FILM.lib, c = document.createElement('canvas'); c.width = 2160; c.height = 2500; const g = c.getContext('2d');
    g.fillStyle = L.PAL.paper; g.fillRect(0, 0, c.width, c.height);
    const strs = ['قاعدة المعرفة', 'كتب كود البناء السعودي بنسختيها العربية والإنجليزية', 'ابحث داخل الكتاب: رقم بند أو كلمات أو سؤال', 'رقم البند · كلمات · بعض الكلمات · المعنى', 'العربية · English · كلاهما', 'اسأل الكتاب', 'يجيب من نص SBC ___ فقط مع ذكر البند', 'ما أقصى مسافة سير إلى المخرج؟ · كم مخرجًا يلزم للطابق؟', 'ما الحد الأدنى لعرض الدرج؟', 'جارٍ البحث في الكتاب…', 'الإجابات من نص الكتاب فقط، وكل اقتباس يُطابَق مع الكتاب حرفيًا قبل عرضه.', 'المصادر · الصفحة الأصلية من الكتاب', 'اسأل الوكيل · اشرح ببساطة · بنود مرتبطة', 'كيف يُفحص على المخطط؟ · هل ينطبق على مشروعي؟', 'الاستثناءات · الجدول ___ · الشكل ___ · مرتبط بهذا البند · كتب مرتبطة', 'قراءة الوكيل من بيانات المشروع المسجّلة، وليست نتيجة فحص.', 'لا أعرف: نص الكتاب لا يكفي للإجابة عن هذا السؤال.', 'اسأل الكود. · كود البناء السعودي، يجاوبك من نصّه. · ابدأ الآن · emtithal.aisc.sa', 'يساعدك امتثال على قراءة كود البناء السعودي وفهمه، ولا يغني عن المهندس المرخّص،', 'ولا يمثّل اعتماداً رسمياً. · 24 · 2024 · 201 · 801'];
    strs.forEach((s, i) => L.txt(g, s, 1060, 60 + i * 56, { size: 30, weight: i % 2 ? 400 : 500, align: 'right', dir: 'rtl' }));
    FILM.SUBS.forEach((cue, i) => { const col = i % 2, row = Math.floor(i / 2); g.save(); g.translate(1080 + col * 540 - 230, row * 270 - 1290); FILM.lib.drawSubtitle(g, cue.in + 0.5 > cue.out ? (cue.in + cue.out) / 2 : cue.in + 0.4, row % 2 ? 'SCH' : 'ILL'); g.restore(); });
    const w = FILM.lib.measure(g, 'كود البناء السعودي', { size: 64, weight: 700 }), w2 = FILM.lib.measure(g, 'كود البناء', { size: 56, weight: 700 }), w3 = FILM.lib.measure(g, '24', { size: 260, weight: 700 });
    return { img: c.toDataURL('image/jpeg', 0.85).split(',')[1], w, w2, w3, max: Math.max(...FILM.SUBS.flatMap((c) => c.lines.map((l) => FILM.lib.measure(g, l, { size: 50, weight: 600 })))) };
  });
  console.log('label64', img.w, 'label56 line1', img.w2, 'num', img.w3, 'max subtitle line px', img.max);
  fs.writeFileSync(path.join(root, 'build/arabic-test.jpg'), Buffer.from(img.img, 'base64')); await b.close();
})();
