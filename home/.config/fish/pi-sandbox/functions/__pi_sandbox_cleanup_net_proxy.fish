function __pi_sandbox_cleanup_net_proxy --argument-names network container
    if test -n "$container"
        command docker rm -f $container >/dev/null 2>&1
    end
    if test -n "$network"
        command docker network rm $network >/dev/null 2>&1
    end
end
