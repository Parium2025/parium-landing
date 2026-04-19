#!/bin/bash
cd "/Users/Anditsdrop/Parium "

# Pull latest changes first
/usr/bin/git pull --quiet

# Push if there are local changes
if ! /usr/bin/git diff --quiet || \
   ! /usr/bin/git diff --cached --quiet || \
   [ -n "$(/usr/bin/git ls-files --others --exclude-standard)" ]; then
  /usr/bin/git add -A
  /usr/bin/git commit -m "Auto-save: $(date '+%Y-%m-%d %H:%M')"
  /usr/bin/git push --quiet
fi
