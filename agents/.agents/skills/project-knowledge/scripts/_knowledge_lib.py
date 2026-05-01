#!/usr/bin/env python3
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

ROOT = Path.cwd()
KNOWLEDGE = ROOT / 'knowledge'
TYPE_DIRS = {
    'source': 'sources',
    'note': 'notes',
    'decision': 'decisions',
    'question': 'questions',
    'index': 'indexes',
}
STATUSES = {
    'source': {'unprocessed', 'processed', 'archived'},
    'note': {'active', 'superseded', 'archived'},
    'decision': {'proposed', 'accepted', 'superseded'},
    'question': {'open', 'answered', 'obsolete'},
    'index': {'active', 'archived'},
}
REQUIRED_SECTIONS = {
    'source': ['Source', 'Raw Material', 'Extracted Items'],
    'note': ['Summary', 'Details', 'Evidence', 'Related'],
    'decision': ['Decision', 'Context', 'Rationale', 'Consequences', 'Related'],
    'question': ['Question', 'Why It Matters', 'Current Understanding', 'Resolution'],
    'index': ['Purpose', 'Key Links', 'Open Questions', 'Recent Changes'],
}
LENGTH_WARN = {'question': 80, 'decision': 120, 'note': 150, 'index': 200, 'source': 400}

@dataclass
class Note:
    path: Path
    meta: dict
    body: str


def slugify(text: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
    return slug or 'untitled'


def parse_scalar(value: str):
    value = value.strip()
    if value.startswith('[') and value.endswith(']'):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [part.strip().strip('"\'') for part in inner.split(',') if part.strip()]
    return value.strip('"\'')


def parse_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith('---\n'):
        raise ValueError('missing opening frontmatter delimiter')
    end = text.find('\n---\n', 4)
    if end == -1:
        raise ValueError('missing closing frontmatter delimiter')
    raw = text[4:end]
    body = text[end + 5:]
    meta = {}
    for line in raw.splitlines():
        if not line.strip():
            continue
        if ':' not in line or line.startswith((' ', '\t')):
            raise ValueError(f'unsupported frontmatter line: {line!r}')
        key, value = line.split(':', 1)
        meta[key.strip()] = parse_scalar(value)
    return meta, body


def read_note(path: Path) -> Note:
    meta, body = parse_frontmatter(path.read_text())
    return Note(path=path, meta=meta, body=body)


def iter_notes() -> list[Note]:
    if not KNOWLEDGE.exists():
        return []
    notes = []
    for path in sorted(KNOWLEDGE.rglob('*.md')):
        try:
            notes.append(read_note(path))
        except Exception as exc:
            notes.append(Note(path=path, meta={'__error__': str(exc)}, body=''))
    return notes


def note_rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix() if path.is_absolute() else path.as_posix()
