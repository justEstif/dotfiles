function nb-vault-gui --description 'Serve the nb vault web UI and open it in the browser'
    set -l url http://localhost:6789

    # start the daemon only if nothing is already serving
    if not curl -sf -o /dev/null $url
        begin
            nohup nb nb-vault:browse --daemon >/dev/null 2>&1
        end &
        # wait for the server to accept connections (max ~5s)
        for _ in (seq 10)
            curl -sf -o /dev/null $url; and break
            sleep 0.5
        end
    end

    if curl -sf -o /dev/null $url
        $BROWSER $url >/dev/null 2>&1 &
        disown
        echo "nb-vault web UI: $url"
    else
        echo "nb-vault-gui: server failed to start on $url" >&2
        return 1
    end
end
