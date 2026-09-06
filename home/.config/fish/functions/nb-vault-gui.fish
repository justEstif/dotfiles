function nb-vault-gui --description 'Serve the nb vault web UI and open it in the browser'
    set -l url http://localhost:6789/nb-vault:

    set -l health http://localhost:6789

    set -l browser $BROWSER
    if test -z "$browser"; and type -q xdg-open
        set browser xdg-open
    end

    # start the daemon only if nothing is already serving
    # (--max-time prevents hanging on a stale, unresponsive server on the port)
    if not curl -sf --max-time 2 -o /dev/null $health
        nohup nb nb-vault:browse --daemon </dev/null >/dev/null 2>&1 &
        disown
        # wait for the server to accept connections (max ~5s)
        for _i in (seq 10)
            curl -sf --max-time 1 -o /dev/null $health; and break
            sleep 0.5
        end
    end

    if curl -sf --max-time 2 -o /dev/null $health
        if test -n "$browser"
            $browser $url >/dev/null 2>&1 &
            disown
        end
        echo "nb-vault web UI: $url"
    else
        echo "nb-vault-gui: server failed to start on $url" >&2
        return 1
    end
end
