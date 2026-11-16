/**
 * GOODWAY WRITE local-only Google Keep Takeout review gate.
 * Never publish, call an API, write to a cloud database, or print note contents.
 * A clean match is NOT a privacy clearance. Every note remains HOLD_CREATOR_REVIEW.
 */
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RULES = [
  ['SECRET_TOKEN', /(?:sk-(?:proj-)?[A-Za-z0-9_-]{12,}|AIza[0-9A-Za-z_-]{20,}|gh[pousr]_[A-Za-z0-9_]{15,}|github_pat_[A-Za-z0-9_]{18,}|xox[baprs]-[A-Za-z0-9-]{10,}|ya29\.[A-Za-z0-9._-]{12,}|-----BEGIN\s+(?:(?:RSA|EC|OPENSSH)\s+)?PRIVATE KEY-----)/i],
  ['CREDENTIAL_FIELD', /(?:API[_\s-]?KEY|ACCESS[_\s-]?TOKEN|REFRESH[_\s-]?TOKEN|CLIENT[_\s-]?SECRET|AUTHORIZATION\s*:|BEARER\s+[A-Za-z0-9._-]{10,}|PASSWORD|PASSCODE|PRIVATE[_\s-]?KEY|CREDENTIALS?|비밀번호|패스워드|인증번호|복구코드|보안코드|계정\s*비번|OTP\b)/i],
  ['PERSONAL_IDENTIFIER', /(?:\b\d{6}[- ]?[1-4]\d{6}\b|주민등록번호|여권번호|운전면허번호|생년월일)/i],
  ['PERSONAL_CONTACT', /(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:\+82[- .]?)?0?1[016789][-. ]?\d{3,4}[-. ]?\d{4}\b)/i],
  ['ACCOUNT_FINANCE', /(?:계좌번호|은행\s*계좌|카드번호|카드\s*유효기간|CVC\b|CVV\b|송금\s*계좌|통장\s*사본)/i],
  ['PRIVATE_ADDRESS', /(?:집\s*주소|자택\s*주소|상세\s*주소|동호수|\b\d{1,4}동\s*\d{1,4}호\b)/i],
  ['INTERNAL_SYSTEM', /(?:DRYWRITER_WEBAPP_URL|https?:\/\/script\.google\.com\/macros\/s\/|https?:\/\/[^\s]+(?:access_token|api_key|client_secret|token|key)=|\.env\b|내부\s*계약|비공개\s*프로젝트|고객\s*명단)/i],
];

function textOf(note) {
  const list = Array.isArray(note.listContent)
    ? note.listContent.map(item => typeof item?.text === 'string' ? item.text : '').filter(Boolean)
    : [];
  return [typeof note.title === 'string' ? note.title : '',
    typeof note.textContent === 'string' ? note.textContent : '', ...list].join('\n').trim();
}

export function classifyKeepNote(note, fileIdentity = '') {
  if (!note || typeof note !== 'object' || Array.isArray(note)) throw new Error('INVALID_KEEP_NOTE');
  const body = textOf(note);
  const digest = createHash('sha256').update(fileIdentity).update('\0').update(body).digest('hex');
  const id = 'KEEP_' + digest.slice(0, 20);
  const flags = RULES.filter(([, pattern]) => pattern.test(body)).map(([name]) => name);
  if (!body) flags.push('EMPTY_NOTE');
  if (note.isTrashed) flags.push('TRASHED_NOTE');
  if (note.isArchived) flags.push('ARCHIVED_NOTE_REVIEW');
  if (Array.isArray(note.collaborators) && note.collaborators.length) flags.push('COLLABORATOR_RIGHTS');
  if (Array.isArray(note.attachments) && note.attachments.length) flags.push('ATTACHMENT_RIGHTS');
  if (typeof note.title !== 'string' && typeof note.textContent !== 'string' && !Array.isArray(note.listContent)) flags.push('UNKNOWN_FORMAT');
  const uniqueFlags = [...new Set(flags)];
  if (uniqueFlags.length) {
    return { contentId: id, origin: 'GOOGLE_KEEP_TAKEOUT', status: 'HOLD_SENSITIVE_NO_DRAFT', publicYn: 'N',
      approvalStatus: 'NOT_REQUESTED', flags: uniqueFlags };
  }
  return {
    contentId: id, origin: 'GOOGLE_KEEP_TAKEOUT', status: 'HOLD_CREATOR_REVIEW', publicYn: 'N',
    approvalStatus: 'NOT_REQUESTED', title: note.title?.trim() || '제목 없는 메모',
    rawText: body, flags: [],
    reviewRequirements: ['SOURCE_RIGHTS', 'PERSONAL_CONTEXT', 'FACT_CHECK', 'BON_SEOMGIM_8',
      'HARMONY_CIRCLE', 'RIGHT_RELATIONSHIP_5', 'CREATOR_EXPLICIT_APPROVAL'],
  };
}

async function collectJsonFiles(dir, max = 10000) {
  const files = [];
  const visit = async location => {
    const entries = await fs.readdir(location, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(location, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) await visit(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
        if (files.length >= max) throw new Error('TOO_MANY_KEEP_FILES');
        files.push(full);
      }
    }
  };
  await visit(dir);
  return files.sort();
}

export async function reviewKeepExport({ inputDir, outputDir }) {
  if (!inputDir || !outputDir) throw new Error('EXPLICIT_INPUT_AND_OUTPUT_REQUIRED');
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const inReal = await fs.realpath(inputDir);
  const out = path.resolve(outputDir);
  const isWithin = (base, target) => target === base || target.startsWith(base + path.sep);
  if (isWithin(root, out) || isWithin(inReal, out)) throw new Error('OUTPUT_MUST_BE_OUTSIDE_REPO_AND_SOURCE');
  process.umask(0o077);
  await fs.mkdir(out, { recursive: true, mode: 0o700 });
  const outReal = await fs.realpath(out);
  if (isWithin(root, outReal) || isWithin(inReal, outReal)) throw new Error('OUTPUT_SYMLINK_IS_UNSAFE');
  await fs.chmod(outReal, 0o700);
  const safe = [];
  const held = [];
  for (const filename of await collectJsonFiles(inReal)) {
    const info = await fs.stat(filename);
    if (info.size > 1024 * 1024) { held.push({ reason: 'OVERSIZED_NOTE' }); continue; }
    let note;
    try { note = JSON.parse(await fs.readFile(filename, 'utf8')); }
    catch { held.push({ reason: 'UNPARSABLE_KEEP_JSON' }); continue; }
    const result = classifyKeepNote(note, path.relative(inReal, filename));
    if (result.status === 'HOLD_CREATOR_REVIEW') safe.push(result);
    else held.push({ contentId: result.contentId, flags: result.flags, status: result.status });
  }
  // This destination is local and explicitly outside the repo; never send private note text upstream.
  for (const draft of safe) {
    await fs.writeFile(path.join(out, draft.contentId + '.review.json'), JSON.stringify(draft, null, 2), { mode: 0o600, flag: 'wx' });
  }
  const manifest = {
    type: 'GOODWAY_KEEP_PRIVACY_REVIEW_V1', publicationEnabled: false, uploadEnabled: false,
    counts: { reviewDrafts: safe.length, blockedOrUnparsed: held.length },
    blocked: held, // no secret titles or original bodies even in local manifest
    note: 'Candidates are not approved for publication or for central index sync.',
  };
  await fs.writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2), { mode: 0o600, flag: 'wx' });
  return manifest.counts;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length !== 4 || args[0] !== '--input-dir' || args[2] !== '--output-dir') {
    console.error('Usage: node scripts/keep-review-gate.mjs --input-dir <extracted-Keep-dir> --output-dir <private-dir-outside-repo>');
    process.exitCode = 2;
  } else {
    reviewKeepExport({ inputDir: args[1], outputDir: args[3] }).then(counts => {
      console.log(JSON.stringify({ status: 'HOLD_CREATOR_REVIEW', ...counts, published: 0 }));
    }).catch(err => {
      console.error('KEEP_LOCAL_REVIEW_HOLD: ' + err.message);
      process.exitCode = 1;
    });
  }
}
