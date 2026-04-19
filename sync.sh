#!/bin/bash
cd "/Users/Anditsdrop/Parium "

# Pull latest changes first
/opt/homebrew/bin/git pull --quiet

# Push if there are local changes
if ! /opt/homebrew/bin/git diff --quiet || \
   ! /opt/homebrew/bin/git diff --cached --quiet || \
   [ -n "$(/opt/homebrew/bin/git ls-files --others --exclude-standard)" ]; then
  /opt/homebrew/bin/git add -A
  /opt/homebrew/bin/git commit -m "Auto-save: $(date '+%Y-%m-%d %H:%M')"
  /opt/homebrew/bin/git push --quiet
fi
