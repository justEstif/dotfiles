function nb-bookmark --description 'Capture a bookmark into the vault inbox (frontmatter + 00_inbox/)'
    if not set -q argv[1]
        echo "usage: nb-bookmark <url> [--quote ...] [--comment ...] [--tags a,b]" >&2
        return 2
    end

    set -l url $argv[1]
    set -l vault ~/.nb/nb-vault
    set -l before (command git -C $vault ls-files '*.bookmark.md')

    nb bookmark $argv >/dev/null 2>&1
    or begin
        echo "nb-bookmark: nb bookmark failed" >&2
        return 1
    end

    # nb auto-checkpoints, so find the new file by diffing tracked bookmarks.
    set -l added
    for f in (command git -C $vault ls-files '*.bookmark.md')
        contains -- $f $before; or set -a added $f
    end
    if not set -q added[1]
        echo "nb-bookmark: no new bookmark file found" >&2
        return 1
    end

    # Human title: first H1 of the bookmark body.
    set -l title (sed -n '/^# /{s/^# //;p;}' $vault/$added | head -1)
    test -n "$title"; or set -l title (basename $added)

    # Governed timestamped name in the inbox, slugged from the title.
    set -l slug (string replace -ar '[^a-z0-9-]' '' -- (string join '-' -- (string split ' ' -- (string lower "$title"))) | string sub -l 60)
    set -l ts (date +%Y%m%d%H%M)
    set -l dest "00_inbox/$ts-$slug.bookmark.md"
    command git -C $vault mv $added $dest

    # Inject vault frontmatter on top.
    set -l file $vault/$dest
    set -l tmp (mktemp)
    printf '%s\n' '---' 'type: capture' "created: "(date +%F) "title: \"$title\"" 'tags: []' '---' '' | cat - $file > $tmp
    and mv $tmp $file

    nb nb-vault:git checkpoint "inbox: bookmark $url" >/dev/null
    echo "Captured: $dest"
end
