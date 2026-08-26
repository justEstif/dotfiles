function __pi_sandbox_setup_net_proxy --argument-names image proxy_script policy_file
    set -l network pi-sandbox-net-(random)(random)
    set -l container pi-sandbox-proxy-(random)(random)

    command docker network create --internal $network >/dev/null
    if test $status -ne 0
        printf 'pi-sandbox: failed to create internal Docker network\n' >&2
        return 1
    end

    command docker run --detach --rm --init \
        --name $container \
        --read-only \
        --network bridge \
        --cap-drop ALL \
        --security-opt no-new-privileges \
        --pids-limit 128 \
        --tmpfs /tmp:rw,noexec,nosuid,nodev,size=64m \
        --mount type=bind,src=$proxy_script,dst=/tmp/hostname-connect-proxy.js,readonly \
        --mount type=bind,src=$policy_file,dst=/tmp/net-policy.json,readonly \
        --env PI_SANDBOX_NET_POLICY=/tmp/net-policy.json \
        --env PI_SANDBOX_PROXY_PORT=8443 \
        --entrypoint node \
        $image /tmp/hostname-connect-proxy.js >/dev/null
    if test $status -ne 0
        command docker network rm $network >/dev/null 2>&1
        printf 'pi-sandbox: failed to start hostname proxy container\n' >&2
        return 1
    end

    command docker network connect --alias pi-sandbox-proxy $network $container >/dev/null
    if test $status -ne 0
        command docker rm -f $container >/dev/null 2>&1
        command docker network rm $network >/dev/null 2>&1
        printf 'pi-sandbox: failed to attach hostname proxy to internal network\n' >&2
        return 1
    end

    printf '%s\n%s\n' $network $container
end
