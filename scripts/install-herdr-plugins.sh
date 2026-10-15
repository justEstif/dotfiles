#!/usr/bin/env bash
set -euo pipefail

installed=$(herdr plugin list)

ensure_plugin() {
  local id=$1 source=$2 ref=$3 line
  while IFS= read -r line; do
    if [[ $line == "- $id ("* && $line == *"[github:$source@$ref]" ]]; then
      printf 'Herdr plugin %s is installed at %s\n' "$id" "$ref"
      return
    fi
  done <<< "$installed"

  herdr plugin install --yes --ref "$ref" "$source"
}

ensure_plugin annotate plannotator/herdr-annotate ceab050b77bea07bbeabdfda5c138be8c9c5c517
ensure_plugin devswha.herdr-web-ui devswha/herdr-web-ui 4ae6a25e1423b99417eb7f7bda24b76231b60455
ensure_plugin herdr-wakeup usrivastava92/herdr-wakeup/plugin v0.1.0
